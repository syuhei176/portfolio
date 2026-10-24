import { useState } from "react";
import { caseStudies } from "~/lib/defi-hacks/case-studies";
import { categoryById, groupBg } from "~/lib/defi-hacks/taxonomy";
import { incidents } from "~/lib/defi-hacks/incidents";
import { formatDateJa, formatUsdM } from "~/lib/defi-hacks/format";

export function CaseStudies({ onSelect }: { onSelect: (id: string) => void }) {
  const [activeId, setActiveId] = useState(caseStudies[0].id);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = caseStudies[(index + delta + caseStudies.length) % caseStudies.length];
    setActiveId(next.id);
    document.getElementById(`case-tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="ケーススタディ"
        className="flex flex-wrap gap-2 border-b-2 border-gray-700"
      >
        {caseStudies.map((c, index) => {
          const incident = incidents.find((i) => i.id === c.incidentId)!;
          const selected = c.id === activeId;
          return (
            <button
              key={c.id}
              id={`case-tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`case-panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(c.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`jp-text text-lg px-4 py-2 -mb-[2px] border-b-2 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-white ${
                selected
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 ${groupBg[categoryById[incident.category].group]}`}
                aria-hidden="true"
              />
              {incident.name}
            </button>
          );
        })}
      </div>

      {caseStudies.map((c) => {
        const incident = incidents.find((i) => i.id === c.incidentId)!;
        return (
          <div
            key={c.id}
            id={`case-panel-${c.id}`}
            role="tabpanel"
            aria-labelledby={`case-tab-${c.id}`}
            hidden={c.id !== activeId}
            className="pt-8"
          >
            <h3 className="jp-text text-2xl md:text-3xl text-white max-w-[46rem]">{c.title}</h3>
            <p className="report-text text-sm text-gray-400 mt-3">
              {formatDateJa(incident.date)}・{incident.chain}・約{formatUsdM(incident.lossUsdM)}・
              {categoryById[incident.category].label}
            </p>
            <p className="report-text text-base md:text-lg text-gray-200 leading-[1.9] mt-5 max-w-[46rem]">
              {c.lede}
            </p>

            <ol className="mt-8 space-y-6 max-w-[46rem]">
              {c.steps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3">
                  <span className="mono-text text-2xl text-gray-500 leading-none pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="jp-text text-lg md:text-xl text-white">{step.title}</h4>
                    <p className="report-text text-[15px] md:text-base text-gray-300 leading-[1.9] mt-1">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {c.code && (
              <figure className="mt-8 max-w-[46rem]">
                <div className="crt-screen border-2 border-gray-700">
                  <pre className="relative z-10 overflow-x-auto p-4 text-[13px] md:text-sm leading-relaxed text-gray-200">
                    <code className="[font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]">
                      {c.code.source}
                    </code>
                  </pre>
                </div>
                <figcaption className="report-text text-sm text-gray-400 mt-2">
                  {c.code.caption}
                </figcaption>
              </figure>
            )}

            <div className="mt-8 max-w-[46rem] border-l-4 border-gray-500 pl-4">
              <h4 className="jp-text text-lg text-white">どこで止められたか</h4>
              <p className="report-text text-[15px] md:text-base text-gray-300 leading-[1.9] mt-1">
                {c.takeaway}
              </p>
            </div>

            <p className="mt-6">
              <a
                href={`#${incident.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(incident.id);
                }}
                className="report-text text-sm text-gray-300 underline decoration-dotted underline-offset-4 hover:text-white"
              >
                事件ファイルで出典を見る
              </a>
            </p>
          </div>
        );
      })}
    </div>
  );
}
