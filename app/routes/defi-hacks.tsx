import { useEffect, useState } from "react";
import type { Route } from "./+types/defi-hacks";
import { LossChain } from "~/components/defi-hacks/LossChain";
import {
  IncidentFiles,
  defaultFilters,
  matchesFilters,
  type Filters,
} from "~/components/defi-hacks/IncidentFiles";
import { Taxonomy } from "~/components/defi-hacks/Taxonomy";
import { Countermeasures } from "~/components/defi-hacks/Countermeasures";
import { YearlyChart } from "~/components/defi-hacks/YearlyChart";
import { CaseStudies } from "~/components/defi-hacks/CaseStudies";
import { incidents } from "~/lib/defi-hacks/incidents";
import { findings, statsSource, statsSources, yearlyStats } from "~/lib/defi-hacks/stats";
import { formatUsdM } from "~/lib/defi-hacks/format";

const URL = "https://www.syuhei176.com/defi-hacks";
const TITLE = "DeFi・暗号資産ハッキング事件の分析と対策 | syuhei176";
const DESCRIPTION =
  "The DAO から Bybit まで、DeFi・ブリッジ・取引所の主要なハッキング事件を、攻撃の手口・根本原因・その後の経過で整理し、開発と運用の対策をまとめました。";
const UPDATED = "2026年10月";

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { tagName: "link", rel: "canonical", href: URL },
    { property: "og:type", content: "article" },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:url", content: URL },
    { property: "og:locale", content: "ja_JP" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@syuhei176" },
  ];
}

const sections = [
  { id: "trends", label: "傾向" },
  { id: "taxonomy", label: "攻撃手法の分類" },
  { id: "files", label: "事件ファイル" },
  { id: "cases", label: "ケーススタディ" },
  { id: "countermeasures", label: "対策" },
  { id: "notes", label: "出典と注記" },
];

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 pt-16 md:pt-24">
      <h2 id={`${id}-title`} className="jp-text text-3xl md:text-4xl text-white">
        {title}
      </h2>
      {lede && (
        <p className="report-text text-base md:text-lg text-gray-300 leading-[1.9] mt-4 max-w-[46rem]">
          {lede}
        </p>
      )}
      <div className="mt-10">{children}</div>
    </section>
  );
}

const chronological = [...incidents].sort((a, b) => a.date.localeCompare(b.date));
const totalLoss = incidents.reduce((sum, i) => sum + i.lossUsdM, 0);
const lastYear = chronological[chronological.length - 1].date.slice(0, 4);

export default function DefiHacks() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  function select(id: string) {
    const incident = incidents.find((i) => i.id === id);
    if (!incident) return;
    if (!matchesFilters(incident, filters)) {
      setFilters({ ...defaultFilters, sort: filters.sort });
    }
    setOpenIds((prev) => new Set(prev).add(id));
    setScrollTarget(id);
    history.replaceState(null, "", `#${id}`);
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!scrollTarget) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const item = document.getElementById(scrollTarget);
    item?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    // キーボードやスクリーンリーダーの利用者も、開いた事件から読み進められるようにする
    item?.querySelector("button")?.focus({ preventScroll: true });
    setScrollTarget(null);
  }, [scrollTarget]);

  // 初回表示時に URL のハッシュで指定された事件を開く
  useEffect(() => {
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (incidents.some((i) => i.id === id)) select(id);
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 md:pt-12">
        <div className="container mx-auto max-w-5xl">
          <a href="/" className="mono-text text-xl text-gray-400 hover:text-white">
            {"<"} syuhei176
          </a>
          <h1 className="mt-10 md:mt-14">
            <span className="block pixel-text text-2xl md:text-5xl leading-tight text-white">
              DEFI HACK LOG
            </span>
            <span className="block jp-text text-2xl md:text-4xl text-gray-200 mt-5">
              DeFi・暗号資産ハッキング事件の分析と対策
            </span>
          </h1>
          <p className="report-text text-base md:text-lg text-gray-300 leading-[1.9] mt-8 max-w-[46rem]">
            2016年の The DAO から{lastYear}年まで、被害額が大きく、手口から学べることの多い
            {incidents.length}件を、攻撃の手口・根本原因・その後の経過で整理した。被害額の合計は約
            {formatUsdM(totalLoss)}
            になる。下のブロックは事件を古い順に並べたもので、面積が被害額、色が原因の大分類を表す。
          </p>
          <p className="report-text text-sm text-gray-500 mt-3">最終更新：{UPDATED}</p>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl md:px-4 mt-12">
        <LossChain incidents={chronological} onSelect={select} />
      </div>

      <main className="px-4">
        <div className="container mx-auto max-w-5xl">
          <nav aria-label="目次" className="mt-14">
            <ul className="report-text flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-gray-400 underline decoration-dotted underline-offset-4 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Section
            id="trends"
            title="傾向"
            lede="攻撃の主戦場は、コントラクトのコードから、鍵を持つ人と署名の手順へ移ってきた。"
          >
            <div className="grid gap-12 md:grid-cols-[1fr_20rem] md:gap-10">
              <YearlyChart data={yearlyStats} source={statsSource} />
              <ul className="space-y-6">
                {findings.map((f) => (
                  <li key={f.title}>
                    <h3 className="jp-text text-xl text-white">{f.title}</h3>
                    <p className="report-text text-[15px] text-gray-300 leading-[1.9] mt-2">
                      {f.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section
            id="taxonomy"
            title="攻撃手法の分類"
            lede="根本原因を7つに分け、それを「コードの欠陥」と「人と運用の欠陥」の2つにまとめた。件数ではコードの欠陥が多いが、2024年以降の被害額は大半が人と運用の欠陥による。"
          >
            <Taxonomy incidents={incidents} onSelect={select} />
          </Section>

          <Section
            id="files"
            title="事件ファイル"
            lede="各事件を開くと、手口の技術的な説明、根本原因、その後の経過、教訓、出典を確認できる。"
          >
            <IncidentFiles
              incidents={incidents}
              filters={filters}
              onFiltersChange={setFilters}
              openIds={openIds}
              onToggle={toggle}
            />
          </Section>

          <Section
            id="cases"
            title="ケーススタディ"
            lede="攻撃の流れを一歩ずつ追うと、どこで止められたかが見えてくる。手口の異なる4件を取り上げる。"
          >
            <CaseStudies onSelect={select} />
          </Section>

          <Section
            id="countermeasures"
            title="対策"
            lede="対策を層ごとに整理し、どの攻撃手法に効くかを対応表にした。監査やファジングのようなコード側の対策は、人と運用の欠陥にはほとんど効かない。逆に、監視・出金制限・対応計画は原因を問わず被害を小さくする。どちらか片方では足りない。"
          >
            <Countermeasures incidents={incidents} onSelect={select} />
          </Section>

          <Section id="notes" title="出典と注記">
            <div className="report-text text-[15px] md:text-base text-gray-300 leading-[1.9] max-w-[46rem] space-y-4">
              <p>
                被害額は事件発生時点の米ドル換算で、出典によって差があるものは代表的な値を採り、各事件の注記に幅を記した。攻撃者が後に返還した額や、凍結された額も被害額に含めている。日付は UTC。
              </p>
              <p>
                掲載した事件は網羅的なリストではなく、被害額と手口から学べることの大きさで選んだ。個人が被害者の事件と、原因が公表されていない事件は除いている。攻撃者の特定は、捜査機関やセキュリティ企業の発表にもとづく。
              </p>
              <p>年次の統計は以下の資料による。Chainalysis は過去の年の値を後の報告で修正することがあり、グラフには各年の報告の初出値を使った。各事件の出典は事件ファイルに記した。</p>
              <ul className="space-y-1">
                {statsSources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-4 text-gray-300 hover:text-cyan-300 break-words"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <p className="mono-text text-xl mt-20">
            <a href="/" className="text-gray-400 hover:text-white">
              {"<"} syuhei176 のトップへ戻る
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
