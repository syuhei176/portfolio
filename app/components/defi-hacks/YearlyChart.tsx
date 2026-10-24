import { useState } from "react";
import { formatUsdM } from "~/lib/defi-hacks/format";
import type { YearStat } from "~/lib/defi-hacks/stats";

const DPRK_COLOR = "#c98500";
const OTHER_COLOR = "#4b5563";

function dprkShare(d: YearStat) {
  return Math.round((d.dprkM / d.totalM) * 100);
}

export function YearlyChart({ data, source }: { data: YearStat[]; source: string }) {
  const step = 1000;
  const top = Math.ceil(Math.max(...data.map((d) => d.totalM)) / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const latest = data[data.length - 1];
  const [activeYear, setActiveYear] = useState(latest.year);
  const active = data.find((d) => d.year === activeYear) ?? latest;

  return (
    <figure className="m-0">
      <p className="report-text text-sm md:text-base text-gray-300 min-h-[5.5rem]" aria-live="polite">
        <span className="mono-text text-2xl text-white mr-2">{active.year}</span>
        盗まれた総額 約{formatUsdM(active.totalM)}、うち北朝鮮関連 約{formatUsdM(active.dprkM)}（
        {dprkShare(active)}%）
        {active.note && (
          <span className="block text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
            {active.note}
          </span>
        )}
      </p>

      <div className="relative mt-4 h-64 md:h-72 ml-12">
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute left-0 right-0 border-t border-gray-800"
            style={{ bottom: `${(t / top) * 100}%` }}
            aria-hidden="true"
          >
            <span className="mono-text absolute -left-12 -translate-y-1/2 w-10 text-right text-base text-gray-500">
              {t === 0 ? "0" : `${t / 100}億`}
            </span>
          </div>
        ))}
        <ol className="relative h-full flex items-end gap-3 md:gap-5">
          {data.map((d) => (
            <li key={d.year} className="flex-1 h-full">
              <button
                type="button"
                onMouseEnter={() => setActiveYear(d.year)}
                onFocus={() => setActiveYear(d.year)}
                onClick={() => setActiveYear(d.year)}
                aria-label={`${d.year}年 約${formatUsdM(d.totalM)}`}
                aria-pressed={d.year === active.year}
                className="w-full h-full flex flex-col justify-end items-center focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  className="w-full max-w-14 flex flex-col gap-0.5 transition-opacity"
                  style={{
                    height: `${(d.totalM / top) * 100}%`,
                    opacity: d.year === active.year ? 1 : 0.7,
                  }}
                >
                  <span
                    className="block w-full rounded-t-[4px]"
                    style={{ flexGrow: d.totalM - d.dprkM, background: OTHER_COLOR }}
                  />
                  <span className="block w-full" style={{ flexGrow: d.dprkM, background: DPRK_COLOR }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <ol className="flex gap-3 md:gap-5 ml-12 mt-2" aria-hidden="true">
        {data.map((d) => (
          <li
            key={d.year}
            className={`flex-1 text-center mono-text text-lg ${d.year === active.year ? "text-white" : "text-gray-500"}`}
          >
            {d.year}
          </li>
        ))}
      </ol>

      <figcaption className="report-text mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5" style={{ background: DPRK_COLOR }} aria-hidden="true" />
          北朝鮮関連と推定される額
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5" style={{ background: OTHER_COLOR }} aria-hidden="true" />
          それ以外
        </span>
        <span>出典：{source}</span>
      </figcaption>

      <details className="report-text mt-4 text-sm text-gray-400">
        <summary className="cursor-pointer hover:text-gray-200">数値を表で見る</summary>
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[22rem] border-collapse">
            <thead>
              <tr className="text-left text-gray-500">
                <th scope="col" className="font-normal py-1 pr-4">年</th>
                <th scope="col" className="font-normal py-1 pr-4 text-right">盗まれた総額</th>
                <th scope="col" className="font-normal py-1 pr-4 text-right">北朝鮮関連</th>
                <th scope="col" className="font-normal py-1 text-right">割合</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.year} className="border-t border-gray-800 text-gray-300">
                  <th scope="row" className="font-normal py-1 pr-4">{d.year}</th>
                  <td className="py-1 pr-4 text-right">{formatUsdM(d.totalM)}</td>
                  <td className="py-1 pr-4 text-right">{formatUsdM(d.dprkM)}</td>
                  <td className="py-1 text-right">{dprkShare(d)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
