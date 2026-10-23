"""Analyse Predy rolls and fee-linked funding from onchain/<version>/logs.json.

V5 (Controller, Aug 2023 - Feb 2024) swaps the out-of-range residual in the pool
itself and emits the realized net residual as `profit`. For those rolls the
transaction receipt also holds the Uniswap Swap event, which gives the residual
token amounts exactly; Proposition 3 then recovers the roll price x and the
liquidity L from -r1/r0 = sqrt(c x).

Outputs figures/onchain_*.pdf, figures/table_onchain.tex, onchain/summary.json.

Run:  uv run --with numpy --with matplotlib python onchain/analyze.py
"""

import bisect
import collections
import datetime as dt
import json
import math
import os
import sys
import urllib.request

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch import VERSIONS, rpc  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
FIG = os.path.join(os.path.dirname(HERE), "figures")
LN_TICK = math.log(1.0001)
Q128 = 2**128
Q96 = 2**96
YEAR = 365 * 24 * 3600
UNI_SWAP = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"
BINANCE = {"WETH": "ETHUSDT", "WBTC": "BTCUSDT", "ARB": "ARBUSDT", "LINK": "LINKUSDT"}
STABLE = {"USDC", "USDC.e", "USD₮0", "USDT", "LUSD"}
BRIDGED_USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"  # USDC.e on Arbitrum
MIN_ACTIVE_USD = 10_000  # months with a smaller Squart position are left out of the funding comparison

plt.rcParams.update({"font.size": 9, "figure.dpi": 150})


def words(data):
    data = data[2:]
    return [data[i:i + 64] for i in range(0, len(data), 64)]


def u256(w):
    return int(w, 16)


def i256(w):
    v = int(w, 16)
    return v - (1 << 256) if v >= 1 << 255 else v


def addr(w):
    return "0x" + w[-40:].lower()


def call(to, selector):
    return rpc({"jsonrpc": "2.0", "id": 1, "method": "eth_call",
                "params": [{"to": to, "data": selector}, "latest"]})["result"]


def symbol(token):
    raw = call(token, "0x95d89b41")[2:]
    if len(raw) > 128:  # dynamic string
        n = int(raw[64:128], 16)
        return bytes.fromhex(raw[128:128 + 2 * n]).decode()
    return bytes.fromhex(raw[:64]).rstrip(b"\0").decode()


def date(ts):
    return dt.datetime.fromtimestamp(ts, dt.timezone.utc).strftime("%Y-%m-%d")


def binance_closes(sym, start, end):
    """Hourly closes {hour_ts: price} from Binance's public market-data API."""
    cache = os.path.join(HERE, f"binance_{sym}.json")
    data = json.load(open(cache)) if os.path.exists(cache) else []
    have = {k[0] for k in data}
    t = start * 1000
    while t < end * 1000:
        if t in have and t + 999 * 3600 * 1000 in have:
            t += 1000 * 3600 * 1000
            continue
        url = (f"https://data-api.binance.vision/api/v3/klines?symbol={sym}&interval=1h"
               f"&startTime={t}&limit=1000")
        req = urllib.request.Request(url, headers={"user-agent": "sqrt-perp-paper/0.1"})
        batch = json.loads(urllib.request.urlopen(req, timeout=60).read())
        if not batch:
            break
        data += [k for k in batch if k[0] not in have]
        have |= {k[0] for k in batch}
        t = batch[-1][0] + 3600 * 1000
    data.sort(key=lambda k: k[0])
    json.dump(data, open(cache, "w"))
    return {int(k[0] / 1000): float(k[4]) for k in data}


def base_in_quote(p, start, end):
    """Hourly price of the base token in quote-token units, or None if not available."""
    def usd(sym):
        if sym in STABLE:
            return None
        if sym not in BINANCE:
            raise KeyError(sym)
        return binance_closes(BINANCE[sym], start, end)
    try:
        b, q = usd(p["base_sym"]), usd(p["quote_sym"])
    except KeyError:
        return None
    if b is None and q is None:
        return None
    if q is None:
        return b
    if b is None:
        return {t: 1 / v for t, v in q.items()}
    return {t: b[t] / q[t] for t in b if t in q}


def load(version):
    d = os.path.join(HERE, version)
    state = json.load(open(os.path.join(d, "logs.json")))
    blocks = json.load(open(os.path.join(d, "blocks.json")))
    by_topic = {v: k for k, v in VERSIONS[version]["topics"].items()}
    events = collections.defaultdict(list)
    for log in state["logs"]:
        name = by_topic[log["topics"][0]]
        w = words(log["data"])
        ev = {"block": int(log["blockNumber"], 16), "index": int(log["logIndex"], 16),
              "ts": blocks[log["blockNumber"]], "tx": log["transactionHash"]}
        if version == "v6":
            if name == "PairAdded":
                ev.update(pair=u256(w[0]), quote=addr(w[1]), pool=addr(w[2]))
            elif name == "AssetRiskParamsUpdated":
                ev.update(pair=u256(w[0]), range_size=i256(w[3]), threshold=i256(w[4]))
            elif name == "Rebalanced":
                ev.update(pair=int(log["topics"][1], 16), relocated=bool(u256(w[0])),
                          lower=i256(w[1]), upper=i256(w[2]), d_base=i256(w[3]), d_quote=i256(w[4]))
            elif name == "PremiumGrowthUpdated":
                ev.update(pair=int(log["topics"][1], 16), total=u256(w[0]), borrowed=u256(w[1]),
                          f0=u256(w[2]), f1=u256(w[3]), spread=u256(w[4]))
        else:
            if name == "PairGroupAdded":
                ev.update(group=u256(w[0]), stable=addr(w[1]))
            elif name == "PairAdded":
                ev.update(pair=u256(w[0]), group=u256(w[1]), pool=addr(w[2]))
            elif name == "AssetRiskParamsUpdated":
                ev.update(pair=u256(w[0]), range_size=i256(w[2]), threshold=i256(w[3]))
            elif name == "Rebalanced":
                ev.update(pair=u256(w[0]), relocated=True, lower=i256(w[1]), upper=i256(w[2]),
                          profit=i256(w[3]))
            elif name == "PremiumGrowthUpdated":
                ev.update(pair=u256(w[0]), total=u256(w[1]), borrowed=u256(w[2]),
                          f0=u256(w[3]), f1=u256(w[4]), spread=u256(w[5]))
        events[name].append(ev)
    for v in events.values():
        v.sort(key=lambda e: (e["block"], e["index"]))
    return events


def pair_info(version, events):
    stables = {e["group"]: e["stable"] for e in events.get("PairGroupAdded", [])}
    pairs = {}
    for ev in events["PairAdded"]:
        pool = ev["pool"]
        t0 = addr(call(pool, "0x0dfe1681")[2:])
        t1 = addr(call(pool, "0xd21220a7")[2:])
        quote = ev["quote"] if version == "v6" else stables[ev["group"]]
        quote_is_0 = quote == t0
        dec = {t: int(call(t, "0x313ce567"), 16) for t in (t0, t1)}
        sym = {t: "USDC.e" if t == BRIDGED_USDC else symbol(t) for t in (t0, t1)}
        fee = int(call(pool, "0xddca3f43"), 16) / 1e6
        base = t1 if quote_is_0 else t0
        pairs[ev["pair"]] = {"pool": pool, "token0": t0, "token1": t1, "dec0": dec[t0], "dec1": dec[t1],
                             "quote_is_0": quote_is_0, "base_sym": sym[base], "quote_sym": sym[quote],
                             "pool_fee": fee, "risk": []}
    for ev in events["AssetRiskParamsUpdated"]:
        pairs[ev["pair"]]["risk"].append((ev["ts"], ev["range_size"], ev["threshold"]))
    return pairs


def raw_price(p, usd_price):
    """Pool price (token1 raw per token0 raw) from the base token's USD price."""
    if p["quote_is_0"]:
        return (1 / usd_price) * 10 ** (p["dec1"] - p["dec0"])
    return usd_price * 10 ** (p["dec1"] - p["dec0"])


def to_quote(p, amount1_raw, x):
    """Convert an amount of token1 (raw) to quote-token units."""
    if p["quote_is_0"]:
        return amount1_raw / x / 10 ** p["dec0"]
    return amount1_raw / 10 ** p["dec1"]


def receipt_swap(tx, pool):
    rec = rpc({"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionReceipt", "params": [tx]})["result"]
    swaps = [l for l in rec["logs"] if l["address"].lower() == pool and l["topics"][0] == UNI_SWAP]
    return swaps


def residual_from_amounts(p, r0, r1, c_tick):
    """Proposition 3: recover x, u, L, R from residual token amounts (r0, r1)."""
    c = 1.0001 ** c_tick
    x = (r1 / r0) ** 2 / c
    liq = abs(r1) / abs(math.sqrt(x) - math.sqrt(c))
    resid1 = x * r0 + r1
    return {"x": x, "u": math.log(x / c), "L": liq, "R1": resid1,
            "notional1": abs(r0) * x, "value1": 2 * liq * math.sqrt(x)}


def analyse_rolls(version, p, rebalanced):
    rolls, prev = [], None
    for ev in rebalanced:
        if prev is None:
            prev = ev
            continue
        if not ev["relocated"]:
            prev = ev
            continue
        r = {"ts": ev["ts"], "block": ev["block"], "tx": ev["tx"], "prev": (prev["lower"], prev["upper"]),
             "new": (ev["lower"], ev["upper"])}
        if version == "v6":
            r["out"] = ev["d_base"] != 0
            if r["out"]:
                r0, r1 = (ev["d_quote"], ev["d_base"]) if p["quote_is_0"] else (ev["d_base"], ev["d_quote"])
        else:
            r["out"] = ev["profit"] != 0
            if r["out"]:
                swaps = receipt_swap(ev["tx"], p["pool"])
                if len(swaps) != 1:
                    r["out_note"] = f"{len(swaps)} swaps"
                    rolls.append(r)
                    prev = ev
                    continue
                w = words(swaps[0]["data"])
                amount0, amount1 = i256(w[0]), i256(w[1])
                d0 = -amount0  # contract's deltaPosition0
                d1 = -amount1 - ev["profit"]  # profit = -amount1 - deltaPosition1
                r0, r1 = -d0, -d1
                r["profit1"] = ev["profit"]
                r["sqrt_after"] = u256(w[2]) / Q96
        if r["out"]:
            c_tick = prev["upper"] if r1 < 0 else prev["lower"]
            res = residual_from_amounts(p, r0, r1, c_tick)
            r.update(c_tick=c_tick, u=res["u"], x_tick=math.log(res["x"]) / LN_TICK,
                     center=(ev["lower"] + ev["upper"]) / 2,
                     outside_prev=not (prev["lower"] <= math.log(res["x"]) / LN_TICK < prev["upper"]),
                     residual_quote=to_quote(p, res["R1"], res["x"]),
                     notional_quote=to_quote(p, res["notional1"], res["x"]),
                     value_quote=to_quote(p, res["value1"], res["x"]))
            if "profit1" in r:
                r["profit_quote"] = to_quote(p, r["profit1"], res["x"])
                r["cost_quote"] = r["residual_quote"] - r["profit_quote"]
        rolls.append(r)
        prev = ev
    return rolls


def realized_var(closes, start, end):
    hrs = sorted(t for t in closes if start <= t <= end)
    if len(hrs) < 2:
        return float("nan")
    lp = np.log([closes[t] for t in hrs])
    return float(np.sum(np.diff(lp) ** 2)) / ((hrs[-1] - hrs[0]) / YEAR)


def analyse_funding(p, prem, closes):
    hours = sorted(closes)
    monthly = collections.defaultdict(lambda: {"fee": 0.0, "premium": 0.0, "util": [], "value": []})
    for ev in prem:
        if ev["total"] == 0:
            continue
        i = bisect.bisect_right(hours, ev["ts"]) - 1
        if i < 0:
            continue
        x = raw_price(p, closes[hours[i]])
        per_v = (ev["f0"] * x + ev["f1"]) / Q128 / (2 * math.sqrt(x))
        key = dt.datetime.fromtimestamp(ev["ts"], dt.timezone.utc).strftime("%Y-%m")
        monthly[key]["fee"] += per_v
        monthly[key]["premium"] += per_v * (1 + ev["spread"] / 1000)
        monthly[key]["util"].append(min(ev["borrowed"] / ev["total"], 1.0))
        monthly[key]["value"].append(to_quote(p, 2 * ev["total"] * math.sqrt(x), x))
    rows = []
    for key in sorted(monthly):
        y, m = map(int, key.split("-"))
        start = int(dt.datetime(y, m, 1, tzinfo=dt.timezone.utc).timestamp())
        end = int(dt.datetime(y + (m == 12), m % 12 + 1, 1, tzinfo=dt.timezone.utc).timestamp())
        years = (end - start) / YEAR
        mo = monthly[key]
        rows.append({"month": key, "n": len(mo["util"]), "fee_yield": mo["fee"] / years,
                     "premium_yield": mo["premium"] / years, "sigma2_over_8": realized_var(closes, start, end) / 8,
                     "util": float(np.mean(mo["util"])), "squart_value_quote": float(np.median(mo["value"]))})
    return rows


def write_outputs(results):
    lines = [r"\begin{tabular}{llrrrrrr}", r"\toprule",
             r"pair (pool fee) & period & $(h,\theta)$ & rolls & rolls/yr & $\sigma^2/(h-\theta)^2$ & out of range & median $|u|$ \\",
             r" & & (ticks) & & & & (share) & (out of range) \\", r"\midrule"]
    all_out = []
    for (version, pid), s in sorted(results.items()):
        rolls = s["rolls"]
        outs = [r for r in rolls if r["out"] and "u" in r]
        all_out += [dict(r, version=version, pair=pid) for r in outs]
        if len(rolls) < 20:
            continue
        years = (rolls[-1]["ts"] - rolls[0]["ts"]) / YEAR
        risk = s["risk"][-1]
        h, th = risk[1] * LN_TICK, risk[2] * LN_TICK
        pred = f"{s['sigma2'] / (h - th) ** 2:.0f}" if s.get("sigma2") else "--"
        med = f"{100 * float(np.median([abs(r['u']) for r in outs])):.2f}\\%" if outs else "--"
        lines.append(
            f"{version.upper()} {s['base']}/{s['quote']} ({1e4 * s['pool_fee']:.0f}\\,bp) & "
            f"{date(rolls[0]['ts'])}--{date(rolls[-1]['ts'])} & ({risk[1]}, {risk[2]}) & {len(rolls)} & "
            f"{len(rolls) / years:.0f} & {pred} & {len(outs)} ({100 * len(outs) / len(rolls):.1f}\\%) & {med} \\\\")
    lines += [r"\bottomrule", r"\end{tabular}"]
    with open(os.path.join(FIG, "table_onchain.tex"), "w") as f:
        f.write("\n".join(lines) + "\n")

    agg = {}
    priced = [r for r in all_out if "profit_quote" in r]
    if priced:
        u = np.array([abs(r["u"]) for r in priced])
        value = np.array([r["value_quote"] for r in priced])
        resid = np.array([r["residual_quote"] for r in priced]) / value
        notional = np.array([r["notional_quote"] for r in priced]) / value
        profit = np.array([r["profit_quote"] for r in priced]) / value
        fee = np.array([r["pool_fee"] for r in priced])
        cost = resid - profit
        usd = [r for r in priced if r["quote_sym"] in STABLE]
        agg = {"n": len(priced), "pairs": sorted({f"{r['version']}-{r['pair']}" for r in priced}),
               "median_abs_u": float(np.median(u)), "p90_abs_u": float(np.percentile(u, 90)),
               "max_abs_u": float(u.max()),
               "cost_over_notional_median": float(np.median(cost / notional)),
               "cost_over_fee_notional_median": float(np.median(cost / (fee * notional))),
               "cost_over_fee_notional_p10_p90": [float(np.percentile(cost / (fee * notional), q)) for q in (10, 90)],
               "share_profit_negative": float(np.mean(profit < 0)),
               "share_cost_below_fee": float(np.mean(cost < fee * notional * 0.999)),
               "usd_sum_residual": float(sum(r["residual_quote"] for r in usd)),
               "usd_sum_profit": float(sum(r["profit_quote"] for r in usd)),
               "x_vs_center_ticks_median_abs": float(np.median([abs(r["x_tick"] - r["center"]) for r in priced])),
               "x_vs_center_ticks_max_abs": float(np.max([abs(r["x_tick"] - r["center"]) for r in priced])),
               "x_vs_center_within_10_ticks": int(sum(abs(r["x_tick"] - r["center"]) <= 10 for r in priced)),
               "all_outside_prev": bool(all(r["outside_prev"] for r in priced))}

        fig, ax = plt.subplots(figsize=(4.6, 3.0))
        grid = np.logspace(math.log10(u.min()) - 0.1, math.log10(u.max()) + 0.1, 200)
        ax.plot(100 * grid, 100 * (np.cosh(grid / 2) - 1), color="k", lw=0.8, ls=":",
                label=r"$\cosh(u/2)-1$ (Prop. 3)")
        ax.scatter(100 * u, 100 * resid, s=10, color="C0", lw=0, label=r"residual $R/V$ from swap amounts")
        ax.scatter(100 * u, 100 * profit, s=14, marker="x", color="C3", lw=0.8,
                   label="realized net surplus (profit)")
        for f, ls in ((0.0005, "--"), (0.003, "-.")):
            ax.plot(100 * grid, 100 * f * (np.exp(grid / 2) - 1) / 2, color="0.5", lw=0.8, ls=ls,
                    label=f"fee on residual swap ({1e4 * f:.0f} bp)")
        ax.set_xscale("log")
        ax.set_yscale("log")
        ax.set_xlabel(r"log overshoot $|u|$ (%)")
        ax.set_ylabel(r"relative to position value $V$ (%)")
        ax.legend(frameon=False, fontsize=6.5, loc="upper left")
        fig.tight_layout()
        fig.savefig(os.path.join(FIG, "onchain_residual.pdf"))
        plt.close(fig)

    fund = [(k, s) for k, s in sorted(results.items()) if s.get("funding_active")]
    if fund:
        fig, ax = plt.subplots(figsize=(4.6, 3.2))
        hi = 0
        flines = [r"\begin{tabular}{llrrrr}", r"\toprule",
                  r"version, pair & pool fee & months & $\sum$ fees / $\sum \sigma^2/8$ & mean $U$ & premium uplift \\",
                  r"\midrule"]
        for i, ((version, pid), s) in enumerate(fund):
            rows = s["funding_active"]
            xs = np.array([100 * r["sigma2_over_8"] for r in rows])
            ys = np.array([100 * r["fee_yield"] for r in rows])
            hi = max(hi, xs.max(), ys.max())
            label = f"{version.upper()} {s['base']}/{s['quote']} {1e4 * s['pool_fee']:.0f}bp"
            if version == "v5" and s["risk"]:
                label += f" ({s['risk'][-1][1]})"
            ax.scatter(xs, ys, s=14, color=f"C{i}", label=label)
            prem = sum(r["premium_yield"] for r in rows) / sum(r["fee_yield"] for r in rows) - 1
            flines.append(f"{version.upper()}, {s['base']}/{s['quote']} & {1e4 * s['pool_fee']:.0f}\\,bp & {len(rows)} & "
                          f"{sum(r['fee_yield'] for r in rows) / sum(r['sigma2_over_8'] for r in rows):.2f} & "
                          f"{np.mean([r['util'] for r in rows]):.2f} & {100 * prem:.1f}\\% \\\\")
            s["fee_to_sigma_ratio"] = sum(r["fee_yield"] for r in rows) / sum(r["sigma2_over_8"] for r in rows)
        flines += [r"\bottomrule", r"\end{tabular}"]
        with open(os.path.join(FIG, "table_funding.tex"), "w") as f:
            f.write("\n".join(flines) + "\n")
        ax.plot([0, hi * 1.05], [0, hi * 1.05], color="k", lw=0.8, ls=":", label="fees $=\\sigma^2/8$")
        ax.set_xlabel(r"realized $\sigma^2/8$, annualized (%)")
        ax.set_ylabel(r"pool fees per unit of $V$, annualized (%)")
        ax.legend(frameon=False, fontsize=6.5, loc="upper left")
        fig.tight_layout()
        fig.savefig(os.path.join(FIG, "onchain_funding.pdf"))
        plt.close(fig)
    return agg


def main():
    results = {}
    for version in ("v5", "v6"):
        if not os.path.exists(os.path.join(HERE, version, "blocks.json")):
            continue
        events = load(version)
        pairs = pair_info(version, events)
        print(version, {k: len(v) for k, v in events.items()})
        for pid, p in sorted(pairs.items()):
            reb = [e for e in events["Rebalanced"] if e["pair"] == pid]
            prem = [e for e in events["PremiumGrowthUpdated"] if e["pair"] == pid]
            rolls = analyse_rolls(version, p, reb)
            for r in rolls:
                r["pool_fee"] = p["pool_fee"]
                r["quote_sym"] = p["quote_sym"]
            s = {"base": p["base_sym"], "quote": p["quote_sym"], "pool": p["pool"], "pool_fee": p["pool_fee"],
                 "risk": p["risk"], "rolls": rolls, "n_premium": len(prem)}
            ts = [e["ts"] for e in prem] + [r["ts"] for r in rolls]
            closes = None
            if ts:
                start, end = min(ts) // 3600 * 3600 - 3600, max(ts) // 3600 * 3600 + 3600
                closes = base_in_quote(p, start, end)
            if closes:
                if len(rolls) > 1:
                    s["sigma2"] = realized_var(closes, rolls[0]["ts"], rolls[-1]["ts"])
                if prem:
                    s["funding"] = analyse_funding(p, prem, closes)
                    if p["quote_sym"] in STABLE:
                        s["funding_active"] = [r for r in s["funding"] if r["squart_value_quote"] >= MIN_ACTIVE_USD]
            results[(version, pid)] = s
            n_out = sum(r["out"] for r in rolls)
            print(f"  pair {pid} {p['base_sym']}/{p['quote_sym']} fee={p['pool_fee']} risk={p['risk']} "
                  f"rolls={len(rolls)} out={n_out} premium_events={len(prem)} sigma2={s.get('sigma2')}")
    agg = write_outputs(results)
    summary = {"out_of_range_rolls": agg,
               "pairs": {f"{v}-{k}": s for (v, k), s in results.items()}}
    json.dump(summary, open(os.path.join(HERE, "summary.json"), "w"), indent=1, default=str)
    print(json.dumps(agg, indent=1))
    for (v, k), s in sorted(results.items()):
        if s.get("fee_to_sigma_ratio") is not None:
            print(v, k, s["base"], s["quote"], s["pool_fee"], "months", len(s["funding_active"]),
                  "fees/(sigma^2/8) = %.2f" % s["fee_to_sigma_ratio"])


if __name__ == "__main__":
    main()
