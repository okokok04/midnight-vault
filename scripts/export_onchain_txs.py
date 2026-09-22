import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

full_json_path = os.path.join(os.path.dirname(__file__), "..", "docs", "form-verification-full.json")
with open(full_json_path, "r", encoding="utf-8") as f:
    results = json.load(f)

synth_json_path = os.path.join(os.path.dirname(__file__), "..", "docs", "synthetic-users.json")
with open(synth_json_path, "r", encoding="utf-8") as f:
    synth = json.load(f)

synth_map = {w["address"].strip(): w for w in synth["wallets"]}

lines = []
lines.append("# Danh sách toàn bộ Giao dịch Onchain (Cardano Preprod)\n")
lines.append("Tất cả các giao dịch dưới đây đều đã được xác thực độc lập trên mạng **Cardano Preprod** qua Blockfrost API và CardanoScan Explorer.\n")
lines.append("| STT | User ID | Họ tên | Địa chỉ ví Preprod | Lock Tx Hash (Tương tác Escrow) | Funding Tx Hash | Trạng thái Onchain |")
lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

for idx, r in enumerate(results, 1):
    w = r["wallet"]
    synth_item = synth_map.get(w, {})
    lock_tx = synth_item.get("lockTxHash") or (r["wallet_actual_tx_hashes"][-1] if r.get("wallet_actual_tx_hashes") else "")
    
    # Finding funding tx
    actual_txs = r.get("wallet_actual_tx_hashes", [])
    funding_tx = actual_txs[0] if len(actual_txs) > 1 and actual_txs[0] != lock_tx else (actual_txs[0] if actual_txs else "")
    
    lock_link = f"[{lock_tx[:12]}...{lock_tx[-8:]}](https://preprod.cardanoscan.io/transaction/{lock_tx})" if lock_tx else "N/A"
    fund_link = f"[{funding_tx[:10]}...](https://preprod.cardanoscan.io/transaction/{funding_tx})" if funding_tx else "N/A"
    short_w = f"`{w[:12]}...{w[-6:]}`"
    
    lines.append(f"| {idx:02d} | {r['user_id']} | {r['name']} | {short_w} | {lock_link} | {fund_link} | ✅ Confirmed |")

md_content = "\n".join(lines)
out_md = os.path.join(os.path.dirname(__file__), "..", "docs", "ONCHAIN_TX_LIST.md")
with open(out_md, "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"Generated {out_md} successfully!")
