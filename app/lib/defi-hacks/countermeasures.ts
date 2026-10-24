import type { CategoryId } from "./taxonomy";

/** 2 = 主な予防策、1 = 部分的に効く・被害を小さくする */
export type Coverage = 1 | 2;

export interface Countermeasure {
  id: string;
  title: string;
  detail: string;
  coverage: Partial<Record<CategoryId, Coverage>>;
  /** この対策があれば防げた・被害を抑えられた事件 */
  incidents: string[];
}

export interface Layer {
  id: string;
  label: string;
  measures: Countermeasure[];
}

const allCategories: Record<CategoryId, Coverage> = {
  logic: 1,
  reentrancy: 1,
  math: 1,
  crypto: 1,
  economic: 1,
  key: 1,
  "supply-chain": 1,
};

export const layers: Layer[] = [
  {
    id: "build",
    label: "実装",
    measures: [
      {
        id: "cei",
        title: "外部呼び出しの前に状態を確定させる",
        detail:
          "Checks-Effects-Interactions を徹底し、共有状態を持つ関数群はまとめて再入ガードで守る。transient storage（EIP-1153）を使えば安価にコントラクト全体のロックをかけられる。再入中の不整合な状態を view 関数が返してしまう read-only reentrancy にも注意する。",
        coverage: { reentrancy: 2 },
        incidents: ["the-dao", "curve-vyper", "gmx"],
      },
      {
        id: "invariant-check",
        title: "状態を変える全経路の最後で健全性を検査する",
        detail:
          "借入・寄付・清算・移転など、ポジションを動かす関数すべての終わりで担保比率などの不変条件を確認する。後から関数を足したときに検査が抜けるのが典型的な失敗。",
        coverage: { logic: 2, economic: 1 },
        incidents: ["euler"],
      },
      {
        id: "rounding",
        title: "丸め方向をプロトコル有利に統一する",
        detail:
          "受け取る側の計算は切り上げ、渡す側の計算は切り捨てに揃える。外部の数値演算ライブラリも信用せず、オーバーフロー検査やビットシフトの境界値を自分でテストする。",
        coverage: { math: 2 },
        incidents: ["kyberswap", "cetus", "balancer"],
      },
      {
        id: "init-access",
        title: "初期化・権限まわりを手順ごとテストする",
        detail:
          "デプロイとアップグレードをスクリプト化してフォーク環境で再現し、0x00 や address(0) が「有効な値」として通らないか確かめる。任意の calldata を転送する関数や、検証者セットを書き換えられる関数は呼び出し元を限定する。",
        coverage: { logic: 2 },
        incidents: ["nomad", "parity-multisig", "parity-freeze", "poly-network"],
      },
      {
        id: "crypto-impl",
        title: "鍵生成と署名は検証済みの標準実装に任せる",
        detail:
          "署名のナンスは RFC 6979 などの決定論的な方式や標準ライブラリに任せ、独自に改変しない。鍵生成の乱数源はビルド設定まで含めて第三者に監査させ、出荷前に生成した鍵のエントロピーを統計的に検査する。",
        coverage: { crypto: 2 },
        incidents: ["upbit", "coldcard"],
      },
    ],
  },
  {
    id: "verify",
    label: "検証",
    measures: [
      {
        id: "fuzz",
        title: "不変条件ファジングと形式検証",
        detail:
          "Foundry の invariant test や Echidna・Medusa で、「総負債は総担保を超えない」といった性質をランダムな操作列に対して検査する。数値演算ライブラリや署名・証明の検証ロジックは Certora や Halmos で形式検証する。",
        coverage: { logic: 2, math: 2, reentrancy: 1, crypto: 1, economic: 1 },
        incidents: ["euler", "kyberswap", "cetus", "balancer", "wormhole", "liquid-network"],
      },
      {
        id: "audit",
        title: "監査とバグバウンティを継続する",
        detail:
          "監査はある時点のスナップショットでしかない。コードを変えるたびの再監査、競争型監査、被害想定額に見合った報奨金のバグバウンティを組み合わせる。Euler も Nomad も監査済みだった。GMX と Liquid Network では、以前の不具合を直す修正そのものが新しい脆弱性を持ち込んだ。資産が残る古いコントラクトも対象から外さない。",
        coverage: { logic: 1, reentrancy: 1, math: 1, crypto: 1, economic: 1 },
        incidents: ["euler", "nomad", "gmx", "liquid-network", "truebit"],
      },
      {
        id: "toolchain",
        title: "コンパイラと依存のバージョンを固定し、既知バグを追う",
        detail:
          "コンパイラとライブラリのバージョンを固定し、既知バグの告知が出たら自分のデプロイ済みコントラクトと突き合わせる。Curve の事件では、ソースコードは正しくてもコンパイラが再入ロックを壊していた。",
        coverage: { reentrancy: 1, "supply-chain": 1 },
        incidents: ["curve-vyper"],
      },
    ],
  },
  {
    id: "economic",
    label: "経済設計",
    measures: [
      {
        id: "oracle",
        title: "操作されにくい価格源を使う",
        detail:
          "単一プールのスポット価格を担保評価に使わない。TWAP や外部オラクルなど複数の価格源を組み合わせ、ソース間の乖離が大きいときは処理を止める。",
        coverage: { economic: 2 },
        incidents: ["bzx", "harvest", "cream", "mango"],
      },
      {
        id: "caps",
        title: "流動性の薄い資産に上限をかける",
        detail:
          "担保として受け入れる資産ごとに、市場の厚みに応じた担保掛け目・供給上限・借入上限を設定する。価格を動かせても、その価格で借りられる額が小さければ攻撃は割に合わない。",
        coverage: { economic: 2 },
        incidents: ["mango", "cream", "tectonic"],
      },
      {
        id: "governance",
        title: "ガバナンスに時間差を入れる",
        detail:
          "投票権は提案前のスナップショットで数え、可決から実行までタイムロックを置く。即時実行の緊急手続きは、同じブロック内で借りたトークンで発動できないようにする。定足数は実際の投票率に合わせ、提案に含まれる命令はデコードして投票者に見せる。",
        coverage: { economic: 2 },
        incidents: ["beanstalk", "bonkdao"],
      },
    ],
  },
  {
    id: "keys",
    label: "鍵・署名・配信経路",
    measures: [
      {
        id: "signer-diversity",
        title: "署名者を組織・端末・場所で分散する",
        detail:
          "マルチシグの閾値は、単一の組織や個人が過半を握らない構成にする。一時的に委任した署名権限やAPIキーは期限を決めて回収する。MPC や HSM も、運用が一人や一社に集中すれば同じ弱点を持つ。ブリッジの検証者も同じで、KelpDAO は単一の検証者とそのノードに依存していた。",
        coverage: { key: 2 },
        incidents: ["ronin", "harmony", "multichain", "orbit", "kelpdao"],
      },
      {
        id: "clear-signing",
        title: "署名する中身を独立に検証する",
        detail:
          "署名前に、ウォレットUIとは別の環境でトランザクションをデコード・シミュレーションし、Safe の tx hash をハードウェアウォレットの表示と照合する。operation が delegatecall になっていないか、宛先が想定どおりかを確認する。",
        coverage: { key: 2, "supply-chain": 2 },
        incidents: ["bybit", "radiant", "wazirx", "drift"],
      },
      {
        id: "policy",
        title: "危険な操作をコントラクト側で拒否する",
        detail:
          "Safe の Guard やポリシーエンジンで、delegatecall、owner や実装アドレスの変更、許可リスト外への送金を拒否する。権限の変更と高額の移動にはタイムロックをかける。人が騙されても、コントラクトが止める。",
        coverage: { key: 2, "supply-chain": 1 },
        incidents: ["bybit", "wazirx", "radiant", "drift"],
      },
      {
        id: "social-engineering",
        title: "採用・取引先を装う接触を前提にする",
        detail:
          "北朝鮮系のグループは、偽の求人、採用試験のコード課題、取引先を装ったファイル共有でエンジニアの端末に入り込む。署名権限や本番環境の権限を持つ人ほど、外部のファイルを開く端末と業務端末を分ける。",
        coverage: { key: 2 },
        incidents: ["ronin", "dmm-bitcoin", "radiant", "bybit", "drift"],
      },
      {
        id: "third-party",
        title: "委託先と外部サービスを信頼の境界の外に置く",
        detail:
          "ウォレット事業者、カストディ、ステーキングAPI、署名UIなど、外部から受け取ったトランザクションや出金指示をそのまま署名・実行しない。宛先・金額・命令の種類を自社の側で独立に検証し、許可リストと上限を適用する。DMM Bitcoin、WazirX、Bybit、SwissBorg、Bitget は、いずれも委託先や外部製品が入口だった。",
        coverage: { key: 2, "supply-chain": 2 },
        incidents: ["dmm-bitcoin", "wazirx", "bybit", "swissborg", "bitget"],
      },
      {
        id: "frontend",
        title: "フロントエンドの配信経路を守る",
        detail:
          "デプロイ権限を多要素認証と最小権限で絞り、配信中のJavaScriptが署名済みのビルド成果物と一致するかを監視する。SRI、CSP、DNS・レジストラのロックも入れる。",
        coverage: { "supply-chain": 2 },
        incidents: ["badger", "bybit"],
      },
    ],
  },
  {
    id: "respond",
    label: "監視と対応",
    measures: [
      {
        id: "monitor",
        title: "異常な資金移動を監視し、自動で止める",
        detail:
          "大口出金、権限変更、価格の急変を常時監視し、検知したら pause guardian が即座に停止できるようにする。Ronin は流出に6日間気づかなかった。",
        coverage: allCategories,
        incidents: ["ronin", "nomad", "kelpdao", "cetus"],
      },
      {
        id: "rate-limit",
        title: "出金にレート制限と遅延をかける",
        detail:
          "一定時間あたりの流出量に上限を設け、大口の引き出しは遅延させる。原因の種類を問わず、被害の上限を前もって決められる数少ない手段。Liquid Network では、約4,000 BTC の払い出しが人の確認なしに通った。",
        coverage: allCategories,
        incidents: ["nomad", "ronin", "wormhole", "bnb-bridge", "liquid-network"],
      },
      {
        id: "response",
        title: "インシデント対応を平時に決めておく",
        detail:
          "停止権限を持つ人、連絡先（SEAL 911、取引所、ステーブルコイン発行体、チェーンのバリデータ）、ホワイトハットとの交渉方針（Safe Harbor 協定、報奨金の上限）を事前に決めておく。資金の凍結や返還交渉は最初の数時間で決まる。",
        coverage: allCategories,
        incidents: ["euler", "cetus", "kelpdao", "bybit"],
      },
    ],
  },
];
