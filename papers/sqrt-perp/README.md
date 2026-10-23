# Square-Root Perpetuals from Concentrated Liquidity

HackMD のノート「Uniswap V3から√x perpを作成する」(https://hackmd.io/@syuhei/SkT-vXWTi) を論文にしたドラフト（arXiv 投稿を想定した英語版）。

## ビルド

このディレクトリ（`papers/sqrt-perp`）で実行する。

```bash
uv run --with numpy --with matplotlib python sim/simulate.py   # シミュレーションの図表を再生成（約40秒）
python3 onchain/fetch.py v5 && python3 onchain/fetch.py v6       # Arbitrum からイベント取得（公開 RPC、十数分）
uv run --with numpy --with matplotlib python onchain/analyze.py  # オンチェーンの図表を再生成
latexmk -pdf main.tex
cp main.pdf ../../public/papers/sqrt-perp.pdf                   # サイトで公開している PDF を更新
```

## 構成

- `main.tex` 本文、`refs.bib` 参考文献
- `sim/simulate.py` GBM シミュレーション。トークン保有量を burn/mint/swap ごとに追跡し、Proposition 1〜3 を数値で検証する
- `onchain/` Predy V5 (Controller `0x06a6…9829`) と V6 (PredyPool `0x9215…8613`) のイベント取得・集計
- `figures/` 生成物（`payoff.pdf`, `path.pdf`, `residual.pdf`, `table_rolls.tex`, `results.json`）

## 残っている作業（本文中の赤字 `\todo{}`）

1. （済）所属は Teliha, Inc.、日付は 2026-10-22
2. （済）経緯の一文。ノートの作成日は 2023-02-08（HackMD のメタデータ）、本番開始は Predy V3.2 の 2023-03（著者確認済み）
3. （済）Predy のオンチェーン実証（第9節）。V5 が主データ。V6 は Squart 流動性が 2024-04-18〜05-14 のみ
   - 要検討：V6（ネイティブ USDC プール、2024年）で手数料/σ²/8 が 0.17 と低い理由
4. （済）コード公開先は https://github.com/syuhei176/portfolio/tree/main/papers/sqrt-perp
5. 第7節の実装説明が正しいかの確認。V6 は Code4rena 監査版（`code-423n4/2024-05-predy`）、V5 は `predyprotocol/sqrt-contracts` を読んで書いたもの
6. 未確認の参考文献（`refs.bib` の `TODO verify`）
   - Clark (2021) の本文：v3 の複製をどこまで扱っているか
   - Deng et al.、Neuder et al.、Fan et al. の著者名と arXiv ID
   - GammaSwap と InfinityPools の一次資料（ホワイトペーパー）

投稿前に `\todo` マクロとその呼び出しを削除する。
