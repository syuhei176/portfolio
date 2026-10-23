"""Map event topic0 hashes to signatures using the deployment ABIs."""
import glob, json, sys
from Crypto.Hash import keccak

def canon(t):
    if t["type"].startswith("tuple"):
        return "(" + ",".join(canon(c) for c in t["components"]) + ")" + t["type"][5:]
    return t["type"]

out = {}
for f in glob.glob(sys.argv[1] + "/*.json"):
    for e in json.load(open(f)).get("abi", []):
        if e.get("type") != "event":
            continue
        sig = e["name"] + "(" + ",".join(canon(i) for i in e["inputs"]) + ")"
        k = keccak.new(digest_bits=256); k.update(sig.encode())
        out["0x" + k.hexdigest()] = {"sig": sig, "inputs": e["inputs"]}
json.dump(out, open(sys.argv[2], "w"), indent=1)
for h, v in sorted(out.items(), key=lambda kv: kv[1]["sig"]):
    print(h[:12], v["sig"][:110])
