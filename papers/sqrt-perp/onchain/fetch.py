"""Fetch Predy V6 events from Arbitrum One through a public RPC.

Writes onchain/<version>/logs.json (raw logs) and onchain/<version>/blocks.json (timestamps).

Run:  python3 onchain/fetch.py v6|v5
"""

import json
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RPC = os.environ.get("ARB_RPC", "https://arb1.arbitrum.io/rpc")
RPCS = [RPC]
# Predy V6 PredyPool (predyx) and Predy V5 Controller (sqrt-contracts) on Arbitrum One.
VERSIONS = {
    "v6": {
        "address": "0x9215748657319B17fecb2b5D086A3147BFBC8613",
        "deploy_block": 171_222_327,
        "topics": {
            "Rebalanced": "0x83500d107cccf2b70f13e00e5e3f90366eb7ca3477444851eac3d6ec9d8eea16",
            "PremiumGrowthUpdated": "0x4f3e43e713f947281f0deec9c972d8bed677658e3f98271fbec9a52ca8f79bd7",
            "PairAdded": "0xbdf0e5eca458f21fa7f881795ad7abfa4ba00bf6ef9fd52b07fcd6d78e557de3",
            "AssetRiskParamsUpdated": "0x2629b119f06606374582e6c88170c0a494bde68b5e739e3afa8f07c29159634d",
        },
    },
    "v5": {
        "address": "0x06a61E55d4d4659b1A23C0F20AEdfc013C489829",
        "deploy_block": 107_855_424,
        "topics": {
            "Rebalanced": "0x4b998b6dc7592fc2de51e33f598608599c7eff6a6a6215b6d8659e238e48c0d2",
            "PremiumGrowthUpdated": "0x4f3e43e713f947281f0deec9c972d8bed677658e3f98271fbec9a52ca8f79bd7",
            "PairAdded": "0x3a3f34d20a2227f3ffc4f50dd584960cad117fd14f35f1d4acceebfa7dc382f6",
            "PairGroupAdded": "0x955050894dd859c8efaf173dbe84ee89cd5643a0b7313fbc6778f7da2343fac8",
            "AssetRiskParamsUpdated": "0x92ed2b5ec0745b7234f6ab040b7f173361ca415308f4c5f82bf30472e3b72864",
        },
    },
}
HERE = os.path.dirname(os.path.abspath(__file__))


def rpc(payload, retries=6, url=RPC):
    data = json.dumps(payload).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers={
                "content-type": "application/json", "user-agent": "sqrt-perp-paper/0.1"})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except Exception as e:  # network hiccup or rate limit
            wait = 2 ** attempt
            print(f"  rpc error {e!r}; retry in {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("RPC failed")


def get_logs(frm, to, url, cfg):
    res = rpc(url=url, payload={"jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [{
        "address": cfg["address"], "fromBlock": hex(frm), "toBlock": hex(to),
        "topics": [list(cfg["topics"].values())]}]})
    if "error" in res:
        if to - frm < 1000:
            raise RuntimeError(res["error"])
        mid = (frm + to) // 2
        return get_logs(frm, mid, url, cfg) + get_logs(mid + 1, to, url, cfg)
    return res["result"]


def main(version):
    cfg = VERSIONS[version]
    out_dir = os.path.join(HERE, version)
    os.makedirs(out_dir, exist_ok=True)
    latest = int(rpc({"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []})["result"], 16)
    out_path = os.path.join(out_dir, "logs.json")
    state = json.load(open(out_path)) if os.path.exists(out_path) else {"next": cfg["deploy_block"], "logs": []}
    step = 2_500_000
    ranges = [(b, min(b + step - 1, latest)) for b in range(state["next"], latest + 1, step)]
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(get_logs, frm, to, RPCS[i % len(RPCS)], cfg) for i, (frm, to) in enumerate(ranges)]
        for (frm, to), fut in zip(ranges, futures):
            logs = fut.result()
            state["logs"] += logs
            state["next"] = to + 1
            json.dump(state, open(out_path, "w"))
            print(f"{frm:>11}-{to:>11}: {len(logs):5} logs (total {len(state['logs'])})", flush=True)

    blocks_path = os.path.join(out_dir, "blocks.json")
    blocks = json.load(open(blocks_path)) if os.path.exists(blocks_path) else {}
    need = sorted({l["blockNumber"] for l in state["logs"]} - set(blocks))
    for i in range(0, len(need), 50):
        batch = [{"jsonrpc": "2.0", "id": j, "method": "eth_getBlockByNumber", "params": [b, False]}
                 for j, b in enumerate(need[i:i + 50])]
        for r in rpc(batch):
            blk = r["result"]
            blocks[blk["number"]] = int(blk["timestamp"], 16)
        json.dump(blocks, open(blocks_path, "w"))
        print(f"timestamps {min(i + 50, len(need))}/{len(need)}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "v6")
