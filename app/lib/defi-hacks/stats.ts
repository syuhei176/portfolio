import type { Source } from "./taxonomy";

export interface YearStat {
  year: number;
  /** 盗まれた総額（百万ドル） */
  totalM: number;
  /** うち北朝鮮関連と推定される額（百万ドル） */
  dprkM: number;
  note?: string;
}

export const statsSource = "Chainalysis（各年の報告の初出値）";

export const yearlyStats: YearStat[] = [
  { year: 2021, totalM: 3200, dprkM: 400 },
  {
    year: 2022,
    totalM: 3800,
    dprkM: 1700,
    note: "後の報告で37億ドルに修正。盗難額の82%が DeFi で、そのうち64%がブリッジだった。",
  },
  {
    year: 2023,
    totalM: 1700,
    dprkM: 1000,
    note: "北朝鮮関連は、2024年12月の報告で約6.6億ドルに下方修正されている。",
  },
  {
    year: 2024,
    totalM: 2200,
    dprkM: 1340,
    note: "2025年12月の報告では、個人ウォレットの被害を含めて約33.8億ドルに修正されている。",
  },
  {
    year: 2025,
    totalM: 3400,
    dprkM: 2020,
    note: "1月から12月上旬まで。個人ウォレットの被害（約7.1億ドル）を含む。Bybit の1件で全体の約44%。",
  },
];

export const findings: { title: string; body: string }[] = [
  {
    title: "被害額は少数の巨大事件で決まる",
    body: "2025年に盗まれた約34億ドルのうち、Bybit の1件だけで約15億ドル、全体の約44%を占めた。上位3件でサービスの被害額の69%になる。平均的な事件ではなく、最悪の事件に備える必要がある。",
  },
  {
    title: "最大の攻撃者は北朝鮮",
    body: "北朝鮮に関連する窃取額は2024年に13.4億ドル（全体の61%）、2025年には20.2億ドルと過去最高を更新した。2026年も Bitget の事件で10億ドルを超えた。偽の求人や取引先を装った接触から始まり、鍵と署名の手順を狙う。",
  },
  {
    title: "コードから、鍵と運用へ",
    body: "2022年は盗難額の82%が DeFi で、その64%がブリッジだった。2024年には秘密鍵の侵害が盗難額の43.8%を占めて最大の要因になり、2025年の第1四半期は中央集権型のサービスが損失の88%を占めた。",
  },
  {
    title: "2026年は件数が過去最多",
    body: "TRM Labs によれば、2026年上半期のハッキングは207件と半年あたりの過去最多だった一方、被害額は約9.7億ドルにとどまった。その後、9月に Liquid Network（約3.2億ドル）と Bitget（約3.9億ドル）が続いた。",
  },
];

export const statsSources: Source[] = [
  {
    label: "Chainalysis: The 2022 Crypto Crime Report（2021年）",
    url: "https://www.chainalysis.com/blog/2022-crypto-crime-report-introduction/",
  },
  {
    label: "Chainalysis: North Korean Hackers Have Prolific Year（2021年の北朝鮮関連）",
    url: "https://www.chainalysis.com/blog/north-korean-hackers-have-prolific-year-as-their-total-unlaundered-cryptocurrency-holdings-reach-all-time-high/",
  },
  {
    label: "Chainalysis: 2022 Biggest Year Ever For Crypto Hacking（2022年）",
    url: "https://www.chainalysis.com/blog/2022-biggest-year-ever-for-crypto-hacking/",
  },
  {
    label: "Chainalysis: Crypto Hacking Stolen Funds 2024（2023年）",
    url: "https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2024/",
  },
  {
    label: "Chainalysis: $2.2 Billion Stolen in Crypto in 2024（2024年）",
    url: "https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/",
  },
  {
    label: "Chainalysis: Crypto Theft Reaches $3.4 Billion（2025年）",
    url: "https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2026/",
  },
  {
    label: "TRM Labs: H1 2026 Crypto Hacks（2026年上半期）",
    url: "https://www.trmlabs.com/resources/blog/h1-2026-crypto-hacks-reach-record-high-as-losses-fall-below-usd-1-billion",
  },
];
