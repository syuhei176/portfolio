export type Group = "code" | "ops";

export type CategoryId =
  | "logic"
  | "reentrancy"
  | "math"
  | "crypto"
  | "economic"
  | "key"
  | "supply-chain";

export type TargetType = "defi" | "bridge" | "cex" | "wallet";

export interface Source {
  label: string;
  url: string;
}

export interface Incident {
  id: string;
  name: string;
  /** YYYY-MM-DD (UTC) */
  date: string;
  chain: string;
  target: TargetType;
  category: CategoryId;
  /** 被害額（事件発生時点の米ドル換算、百万ドル単位） */
  lossUsdM: number;
  /** ネイティブ通貨建ての被害額や、数字の幅についての補足 */
  lossNote?: string;
  recovered?: string;
  attribution?: string;
  summary: string;
  mechanism: string;
  rootCause: string;
  aftermath: string;
  lesson: string;
  sources: Source[];
}

export const groups: Record<Group, { label: string; description: string }> = {
  code: {
    label: "コードの欠陥",
    description:
      "コントラクトやプロトコル設計そのものに穴がある。監査・テスト・形式検証で事前に見つけられる余地がある。",
  },
  ops: {
    label: "人と運用の欠陥",
    description:
      "コードは仕様どおりに動いている。鍵を持つ人、署名に使う端末、配信されるUIが攻撃される。",
  },
};

export interface Category {
  id: CategoryId;
  group: Group;
  label: string;
  short: string;
  description: string;
  pattern: string;
}

export const categories: Category[] = [
  {
    id: "logic",
    group: "code",
    label: "ロジック・検証の欠陥",
    short: "ロジック",
    description:
      "必要な検証が抜けている、初期化やアクセス制御を誤っている、といった実装ミス。ブリッジの署名検証・メッセージ検証の欠陥はここに含まれる。",
    pattern:
      "「誰が」「何を証明したか」の確認が一箇所だけ欠けていて、そこから任意の引き出しやミントが通る。",
  },
  {
    id: "reentrancy",
    group: "code",
    label: "再入",
    short: "再入",
    description:
      "外部呼び出しの最中に、状態を更新する前のコントラクトへもう一度入られる。The DAO 以来の古典だが、コンパイラのバグや読み取り専用の再入として形を変えて再発している。",
    pattern:
      "送金・コールバックの後で残高を減らす実装で、同じ関数や同じ状態を参照する別の関数を再帰的に呼ばれる。",
  },
  {
    id: "math",
    group: "code",
    label: "数値精度・オーバーフロー",
    short: "数値精度",
    description:
      "丸め方向の誤り、精度の取りこぼし、オーバーフロー検査の誤りなど。集中流動性AMMやステーブルスワップのように固定小数点演算が多い設計で起きやすい。",
    pattern:
      "1回あたりは微小な誤差を、境界値の状態をつくってから大量に繰り返し、価格や持分の計算を攻撃者に有利な方向へずらす。",
  },
  {
    id: "crypto",
    group: "code",
    label: "暗号実装・乱数の欠陥",
    short: "暗号実装",
    description:
      "署名や鍵生成に使う乱数が弱い、署名の実装に偏りがある、といった暗号処理そのものの欠陥。鍵を盗まなくても、公開されている情報から鍵を割り出せてしまう。",
    pattern:
      "予測できる乱数で作られた鍵や、偏りのある署名を、ブロックチェーン上の公開データから総当たりや統計分析で割り出す。",
  },
  {
    id: "economic",
    group: "code",
    label: "価格・ガバナンス操作",
    short: "価格操作",
    description:
      "コードは仕様どおりに動くが、価格オラクルや投票権といった経済的な前提が一時的に崩される。フラッシュローンによって、その資本コストはほぼゼロになった。",
    pattern:
      "流動性の薄い市場で価格をつり上げ、その価格で評価された担保で借り入れる。あるいは借りた資金で議決権を得て、即座に提案を通す。",
  },
  {
    id: "key",
    group: "ops",
    label: "鍵・署名プロセスの侵害",
    short: "鍵・署名",
    description:
      "秘密鍵やマルチシグの署名者が、ソーシャルエンジニアリング・マルウェア・内部者によって奪われる、または騙されて悪意あるトランザクションに署名する。被害額ではここ数年の最大要因。",
    pattern:
      "偽の採用面接や取引先を装って端末にマルウェアを入れ、署名画面に正常な取引を表示したまま、実際には権限移譲やコントラクトの差し替えに署名させる。",
  },
  {
    id: "supply-chain",
    group: "ops",
    label: "サプライチェーン・フロントエンド",
    short: "サプライチェーン",
    description:
      "コントラクトの外側、つまりWebフロントエンド、その配信基盤、DNS、依存ライブラリが改ざんされ、利用者に悪意ある承認や送金をさせる。",
    pattern:
      "正規ドメインから配信されるJavaScriptに、特定のウォレットだけを狙って取引内容を書き換えるコードを差し込む。",
  },
];

export const categoryById = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const targetLabels: Record<TargetType, string> = {
  defi: "DeFi",
  bridge: "ブリッジ",
  cex: "取引所",
  wallet: "ウォレット",
};

export const groupBg: Record<Group, string> = {
  code: "bg-hack-code",
  ops: "bg-hack-ops",
};
