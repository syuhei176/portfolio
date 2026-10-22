"""Numerical experiments for the square-root perpetual paper.

Simulates a concentrated-liquidity position plus static account under GBM,
rolls the range with the rule of Proposition 2/3, checks the propositions
numerically, and writes figures and a LaTeX table into ../figures.

Run:  uv run --with numpy --with matplotlib python sim/simulate.py
"""

import json
import math
import os
import time

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIG = os.path.join(ROOT, "figures")
os.makedirs(FIG, exist_ok=True)

MINUTES_PER_YEAR = 365 * 24 * 60
SIGMA = 0.8  # annualised volatility, ETH-like
SWAP_FEE = 0.0005  # 5 bp pool fee charged on the residual swap
L = 0.5  # with x0 = 1 the position is worth 2 L sqrt(x0) = 1

plt.rcParams.update({"font.size": 9, "figure.dpi": 150})


def lp_holdings(x, a, b, liq=L):
    """Token amounts (token0, token1) of a v3 position on [a, b] at price x."""
    c = np.clip(x, a, b)
    return liq * (1 / np.sqrt(c) - 1 / np.sqrt(b)), liq * (np.sqrt(c) - np.sqrt(a))


def static_account(a, b, liq=L):
    return liq / np.sqrt(b), liq * np.sqrt(a)


def simulate(dt_minutes, h, theta, n_paths, years=1.0, seed=0, record_path=False):
    """Roll a range [x e^-h, x e^h] whenever log-distance to a boundary < theta.

    Token holdings are tracked explicitly (burn, mint, transfer into the static
    account, swap of the residual), not through the closed forms, so that the
    propositions can be checked against the simulation.
    """
    rng = np.random.default_rng(seed)
    n_steps = int(round(years * MINUTES_PER_YEAR / dt_minutes))
    dt = dt_minutes / MINUTES_PER_YEAR
    sd = SIGMA * math.sqrt(dt)
    drift = -0.5 * SIGMA**2 * dt  # zero rates: x is a martingale

    logx = np.zeros(n_paths)
    x = np.exp(logx)
    a, b = x * math.exp(-h), x * math.exp(h)
    s0, s1 = static_account(a, b)

    n_roll = np.zeros(n_paths)
    n_out = np.zeros(n_paths)
    surplus = np.zeros(n_paths)  # sum of R / V
    notional = np.zeros(n_paths)  # sum of |swap notional| / V
    err = {"prop1": 0.0, "prop2": 0.0, "prop3": 0.0}
    u_samples, r_samples = [], []
    path = {"t": [], "x": [], "a": [], "b": [], "roll_t": [], "roll_x": [], "roll_out": []}

    for step in range(1, n_steps + 1):
        logx += drift + sd * rng.standard_normal(n_paths)
        x = np.exp(logx)
        if record_path:
            path["t"].append(step * dt)
            path["x"].append(x[0])
            path["a"].append(a[0])
            path["b"].append(b[0])
        trig = (logx - np.log(a) < theta) | (np.log(b) - logx < theta)
        if not trig.any():
            continue
        i = np.nonzero(trig)[0]
        xi, ai, bi = x[i], a[i], b[i]
        out = (xi < ai) | (xi > bi)

        # Proposition 1: LP + static account holds F(clip(x, a, b))
        o0, o1 = lp_holdings(xi, ai, bi)
        c = np.clip(xi, ai, bi)
        err["prop1"] = max(
            err["prop1"],
            np.abs(o0 + s0[i] - L / np.sqrt(c)).max(),
            np.abs(o1 + s1[i] - L * np.sqrt(c)).max(),
        )

        # Roll: burn old, mint same L on the new range, move the difference
        # into the static account, then compare with the target account.
        na, nb = xi * math.exp(-h), xi * math.exp(h)
        n0, n1 = lp_holdings(xi, na, nb)
        t0, t1 = static_account(na, nb)
        r0 = s0[i] + (o0 - n0) - t0
        r1 = s1[i] + (o1 - n1) - t1
        value = 2 * L * np.sqrt(xi)
        rel_surplus = (xi * r0 + r1) / value

        if (~out).any():  # Proposition 2: no residual for in-range rolls
            err["prop2"] = max(err["prop2"], np.abs(r0[~out]).max(), np.abs(r1[~out]).max())
        if out.any():  # Proposition 3: R / V = cosh(u/2) - 1
            u = np.log(xi[out] / c[out])
            err["prop3"] = max(err["prop3"], np.abs(rel_surplus[out] - (np.cosh(u / 2) - 1)).max())
            if len(u_samples) < 20000:
                u_samples.extend(u.tolist())
                r_samples.extend(rel_surplus[out].tolist())

        surplus[i] += rel_surplus
        notional[i] += np.abs(r0) * xi / value
        n_roll[i] += 1
        n_out[i] += out
        a[i], b[i] = na, nb
        s0[i], s1[i] = t0, t1

        if record_path and trig[0]:
            path["roll_t"].append(step * dt)
            path["roll_x"].append(x[0])
            path["roll_out"].append(bool(out[np.searchsorted(i, 0)]))

    per_year = 1 / years
    return {
        "dt_minutes": dt_minutes,
        "h": h,
        "theta": theta,
        "n_paths": n_paths,
        "rolls_per_year": float(n_roll.mean() * per_year),
        "out_share": float(n_out.sum() / max(n_roll.sum(), 1)),
        "surplus_pct_per_year": float(100 * surplus.mean() * per_year),
        "notional_per_year": float(notional.mean() * per_year),
        "net_pct_per_year": float(100 * (surplus - SWAP_FEE * notional).mean() * per_year),
        "errors": err,
        "u": u_samples,
        "r": r_samples,
        "path": path if record_path else None,
    }


def funding_check(n=2_000_000, years=1.0, seed=1):
    rng = np.random.default_rng(seed)
    w = rng.standard_normal(n) * SIGMA * math.sqrt(years)
    sqrt_x = np.exp(0.5 * (w - 0.5 * SIGMA**2 * years))
    mean = float(sqrt_x.mean())
    se = float(sqrt_x.std() / math.sqrt(n))
    return {"mc_mean": mean, "mc_se": se, "theory": math.exp(-SIGMA**2 * years / 8)}


def plot_payoff():
    a, b = 0.8, 1.25
    x = np.linspace(0.35, 2.2, 600)
    target = 2 * L * np.sqrt(x)
    o0, o1 = lp_holdings(x, a, b)
    lp_value = x * o0 + o1
    s0, s1 = static_account(a, b)
    combined = lp_value + x * s0 + s1

    fig, (ax, ax2) = plt.subplots(2, 1, figsize=(4.6, 4.2), sharex=True,
                                  gridspec_kw={"height_ratios": [3, 2]})
    ax.plot(x, target, color="k", lw=1.6, label=r"target $2L\sqrt{x}$")
    ax.plot(x, combined, color="C0", lw=1.2, ls="--", label="LP + static account")
    ax.plot(x, lp_value, color="C1", lw=1.0, label=r"LP on $[a,b]$ alone")
    ax.set_ylabel("value (token1)")
    ax.legend(frameon=False, fontsize=7.5, loc="upper left")

    excess = combined - target
    ax2.plot(x, 100 * excess / target, color="C0", lw=1.2, ls="--")
    ax2.fill_between(x, 0, 100 * excess / target, color="C3", alpha=0.25, label=r"residual $R/V$")
    ax2.set_ylabel(r"excess over target (%)")
    ax2.set_xlabel(r"price $x$")
    ax2.legend(frameon=False, fontsize=7.5, loc="upper center")

    for axis in (ax, ax2):
        for v in (a, b):
            axis.axvline(v, color="0.6", lw=0.8, ls=":")
    for v, name in ((a, "a"), (b, "b")):
        ax.text(v, 1.01, f"${name}$", ha="center", va="bottom", transform=ax.get_xaxis_transform())
    ax.set_xlim(x[0], x[-1])
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "payoff.pdf"))
    plt.close(fig)


def plot_path(res):
    p = res["path"]
    t = np.array(p["t"]) * 365
    fig, ax = plt.subplots(figsize=(4.6, 2.8))
    ax.fill_between(t, p["a"], p["b"], step="pre", color="C0", alpha=0.18, lw=0, label="active range")
    ax.plot(t, p["x"], color="k", lw=0.7, label=r"price $x$")
    rt = np.array(p["roll_t"]) * 365
    rx = np.array(p["roll_x"])
    ro = np.array(p["roll_out"], dtype=bool)
    ax.scatter(rt[~ro], rx[~ro], s=6, color="C0", zorder=3, label="roll (in range)")
    ax.scatter(rt[ro], rx[ro], s=14, marker="x", color="C3", zorder=4, label="roll (out of range)")
    ax.set_xlabel("time (days)")
    ax.set_ylabel(r"price $x$")
    ax.set_xlim(t[0], t[-1])
    ax.legend(frameon=False, fontsize=7, loc="upper left", ncol=2)
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "path.pdf"))
    plt.close(fig)


def plot_residual(samples):
    u = np.abs(np.array(samples["u"]))
    r = np.array(samples["r"])
    keep = u > 0
    u, r = u[keep], r[keep]
    grid = np.logspace(math.log10(u.min()), math.log10(u.max()), 400)
    fig, ax = plt.subplots(figsize=(4.6, 3.0))
    ax.scatter(100 * u, 100 * r, s=4, alpha=0.5, color="C0", lw=0, label="simulated out-of-range rolls")
    ax.plot(100 * grid, 100 * (np.cosh(grid / 2) - 1), color="k", lw=0.9, ls=":",
            label=r"$\cosh(u/2)-1$ (Prop. 3)")
    ax.plot(100 * grid, 100 * SWAP_FEE * (np.exp(grid / 2) - 1) / 2, color="C3", lw=1.0, ls="--",
            label="swap cost at 5 bp")
    ax.axvline(100 * 2 * SWAP_FEE, color="0.6", lw=0.8, ls=":")
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel(r"log overshoot $|u|=|\ln(x/c)|$ (%)")
    ax.set_ylabel(r"$R/V$ (%)")
    ax.legend(frameon=False, fontsize=7.5, loc="upper left")
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "residual.pdf"))
    plt.close(fig)


def fmt(v, digits=3):
    v = round(v, digits)
    return f"{(0.0 if v == 0 else v):.{digits}f}"


def write_table(rows):
    label = {1: "1 min", 10: "10 min", 60: "1 h", 1440: "1 day"}
    lines = [
        r"\begin{tabular}{llrrrrrr}",
        r"\toprule",
        r"$\Delta t$ & $h$ & rolls/yr & $\sigma^2/(h-\theta)^2$ & out-of-range & $\sum R/V$ & swap notional & net of 5\,bp \\",
        r" & & & & share & (\%/yr) & ($\times V$/yr) & (\%/yr) \\",
        r"\midrule",
    ]
    prev = None
    for r in rows:
        if prev is not None and r["dt_minutes"] != prev:
            lines.append(r"\addlinespace")
        prev = r["dt_minutes"]
        lines.append(
            f"{label[r['dt_minutes']]} & {100 * r['h']:.0f}\\% & {r['rolls_per_year']:.0f} & "
            f"{SIGMA**2 / (r['h'] - r['theta'])**2:.0f} & "
            f"{fmt(100 * r['out_share'], 1)}\\% & {fmt(r['surplus_pct_per_year'])} & "
            f"{fmt(r['notional_per_year'])} & {fmt(r['net_pct_per_year'])} \\\\"
        )
    lines += [r"\bottomrule", r"\end{tabular}"]
    with open(os.path.join(FIG, "table_rolls.tex"), "w") as f:
        f.write("\n".join(lines) + "\n")


def main():
    t_start = time.time()
    plot_payoff()

    path_res = simulate(dt_minutes=60, h=0.05, theta=0.01, n_paths=1, years=90 / 365, seed=7,
                        record_path=True)
    plot_path(path_res)

    rows = []
    scatter = {"u": [], "r": []}
    worst = {"prop1": 0.0, "prop2": 0.0, "prop3": 0.0}
    for dt_minutes in (1, 10, 60, 1440):
        for h in (0.02, 0.05, 0.10, 0.20):
            res = simulate(dt_minutes=dt_minutes, h=h, theta=h / 5, n_paths=400, seed=42)
            for k in worst:
                worst[k] = max(worst[k], res["errors"][k])
            if dt_minutes >= 60:
                scatter["u"].extend(res["u"][:3000])
                scatter["r"].extend(res["r"][:3000])
            rows.append({k: v for k, v in res.items() if k not in ("u", "r", "path")})
            print(f"dt={dt_minutes:>4}min h={h:.2f} rolls/yr={res['rolls_per_year']:8.1f} "
                  f"out={100 * res['out_share']:5.1f}% surplus={res['surplus_pct_per_year']:.4f}%/yr "
                  f"net={res['net_pct_per_year']:.4f}%/yr")
    write_table(rows)
    plot_residual(scatter)

    funding = funding_check()
    results = {
        "sigma": SIGMA,
        "swap_fee": SWAP_FEE,
        "funding_rate_theory": SIGMA**2 / 8,
        "funding_check": funding,
        "max_abs_errors": worst,
        "rows": rows,
        "seconds": time.time() - t_start,
    }
    with open(os.path.join(FIG, "results.json"), "w") as f:
        json.dump(results, f, indent=2)
    print(json.dumps({k: results[k] for k in ("funding_check", "max_abs_errors", "seconds")}, indent=2))


if __name__ == "__main__":
    main()
