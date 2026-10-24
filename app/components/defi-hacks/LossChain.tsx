import { useState } from "react";
import {
  categoryById,
  groupBg,
  groups,
  targetLabels,
  type Incident,
} from "~/lib/defi-hacks/taxonomy";
import { formatDateJa, formatUsdM } from "~/lib/defi-hacks/format";


const SPLIT_YEAR = 2024;
const GAP_PX = 6;

/** 面積を被害額に比例させるため、一辺は被害額の平方根に比例させる */
function blockSize(lossUsdM: number) {
  return `max(6px, calc(var(--unit) * ${Math.sqrt(lossUsdM).toFixed(2)}))`;
}

export function LossChain({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect: (id: string) => void;
}) {
  const largest = incidents.reduce((a, b) => (b.lossUsdM > a.lossUsdM ? b : a));
  const labeled = new Set(
    [...incidents]
      .sort((a, b) => b.lossUsdM - a.lossUsdM)
      .slice(0, 5)
      .map((i) => i.id),
  );
  const [activeId, setActiveId] = useState(largest.id);
  const active = incidents.find((i) => i.id === activeId) ?? largest;
  const activeIndex = incidents.indexOf(active);
  const activeCategory = categoryById[active.category];

  const firstYear = incidents[0].date.slice(0, 4);
  const lastYear = incidents[incidents.length - 1].date.slice(0, 4);
  const rows = [
    {
      label: `${firstYear}〜${SPLIT_YEAR - 1}年`,
      items: incidents.filter((i) => Number(i.date.slice(0, 4)) < SPLIT_YEAR),
    },
    {
      label: `${SPLIT_YEAR}〜${lastYear}年`,
      items: incidents.filter((i) => Number(i.date.slice(0, 4)) >= SPLIT_YEAR),
    },
  ];
  // 両方の段で同じ縮尺を使い、長い方の段がコンテナ幅に収まる大きさにする
  const widestSqrt = Math.max(
    ...rows.map((r) => r.items.reduce((sum, i) => sum + Math.sqrt(i.lossUsdM), 0)),
  );
  const mostItems = Math.max(...rows.map((r) => r.items.length));
  const fitUnit = `calc((100cqw - ${(mostItems - 1) * GAP_PX}px) / ${widestSqrt.toFixed(1)})`;

  return (
    <figure className="m-0 px-4 md:px-0 [container-type:inline-size]">
      <div
        className="space-y-6 [--unit:2px] md:[--unit:min(3px,var(--fit))]"
        style={{ "--fit": fitUnit } as React.CSSProperties}
      >
        {rows.map((row, rowIndex) => (
          <div key={row.label}>
            <p className="mono-text text-lg text-gray-500">{row.label}</p>
            <ol
              className="flex flex-wrap md:flex-nowrap items-end gap-y-10 pt-8 border-b-2 border-gray-600 md:border-b-2"
              style={{ columnGap: GAP_PX }}
            >
              {row.items.map((incident, i) => {
                const year = incident.date.slice(0, 4);
                const isFirstOfYear = i === 0 || row.items[i - 1].date.slice(0, 4) !== year;
                const category = categoryById[incident.category];
                const order = rowIndex === 0 ? i : rows[0].items.length + i;
                return (
                  <li key={incident.id} className="relative flex flex-col items-center">
                    {labeled.has(incident.id) && (
                      <span className="mono-text absolute bottom-full mb-1 left-0 text-base text-gray-300 whitespace-nowrap">
                        {incident.name}
                      </span>
                    )}
                    <a
                      href={`#${incident.id}`}
                      aria-label={`${incident.name}、${formatDateJa(incident.date)}、${formatUsdM(incident.lossUsdM)}、${category.label}`}
                      onMouseEnter={() => setActiveId(incident.id)}
                      onFocus={() => setActiveId(incident.id)}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(incident.id);
                      }}
                      className={`chain-block block ${groupBg[category.group]} outline-offset-2 focus-visible:outline-2 focus-visible:outline-white ${
                        incident.id === active.id ? "outline-2 outline-white" : ""
                      }`}
                      style={{
                        width: blockSize(incident.lossUsdM),
                        height: blockSize(incident.lossUsdM),
                        animationDelay: `${order * 45}ms`,
                      }}
                    />
                    {isFirstOfYear && (
                      <span className="mono-text absolute top-full mt-1 left-0 text-base text-gray-400">
                        {`’${year.slice(2)}`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="h-6" aria-hidden="true" />
          </div>
        ))}
      </div>

      <figcaption className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div
          className="crt-screen border-2 border-gray-700 p-4 min-h-[8.5rem]"
          aria-live="polite"
        >
          <div className="relative z-10">
            <p className="mono-text text-lg text-gray-400">
              BLOCK #{activeIndex + 1} / {formatDateJa(active.date)} /{" "}
              {targetLabels[active.target]}・{active.chain}
            </p>
            <p className="jp-text text-xl md:text-2xl text-white mt-1">
              {active.name}
              <span className="ml-3 text-gray-300">
                {formatUsdM(active.lossUsdM)}
              </span>
            </p>
            <p className="report-text text-sm md:text-base text-gray-300 mt-2 leading-relaxed">
              <span
                className={`inline-block w-3 h-3 mr-2 align-[-1px] ${groupBg[activeCategory.group]}`}
                aria-hidden="true"
              />
              {activeCategory.label}：{active.summary}
            </p>
          </div>
        </div>
        <ul className="report-text text-sm text-gray-300 space-y-2 md:w-56">
          {(Object.keys(groups) as (keyof typeof groups)[]).map((g) => (
            <li key={g} className="flex items-center gap-2">
              <span className={`w-4 h-4 shrink-0 ${groupBg[g]}`} aria-hidden="true" />
              {groups[g].label}
            </li>
          ))}
          <li className="text-gray-500 leading-relaxed">
            ブロックの面積が被害額に比例。左から古い順。クリックで詳細へ。
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
