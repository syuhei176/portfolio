import {
  categories,
  categoryById,
  groupBg,
  groups,
  type Group,
  type Incident,
} from "~/lib/defi-hacks/taxonomy";
import { formatUsdM } from "~/lib/defi-hacks/format";

const groupBorder = { code: "border-hack-code", ops: "border-hack-ops" } as const;

const SPLIT_YEAR = 2024;

function percent(part: number, whole: number) {
  return Math.round((part / whole) * 100);
}

export function Taxonomy({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect: (id: string) => void;
}) {
  const total = incidents.reduce((sum, i) => sum + i.lossUsdM, 0);
  const lossOf = (members: Incident[]) => members.reduce((sum, i) => sum + i.lossUsdM, 0);
  const groupIds = Object.keys(groups) as Group[];
  const lastYear = Math.max(...incidents.map((i) => Number(i.date.slice(0, 4))));
  const firstYear = Math.min(...incidents.map((i) => Number(i.date.slice(0, 4))));
  const periods = [
    { label: `${firstYear}〜${SPLIT_YEAR - 1}年`, members: incidents.filter((i) => Number(i.date.slice(0, 4)) < SPLIT_YEAR) },
    { label: `${SPLIT_YEAR}〜${lastYear}年`, members: incidents.filter((i) => Number(i.date.slice(0, 4)) >= SPLIT_YEAR) },
  ].map((p) => {
    const periodTotal = lossOf(p.members);
    const byGroup = groupIds.map((g) => {
      const loss = lossOf(p.members.filter((i) => categoryById[i.category].group === g));
      return { group: g, loss, share: percent(loss, periodTotal) };
    });
    return { ...p, byGroup };
  });

  return (
    <div className="space-y-10">
      <figure className="m-0 space-y-6">
        {periods.map((p) => (
          <div
            key={p.label}
            role="img"
            aria-label={`${p.label}：${p.byGroup.map((b) => `${groups[b.group].label} ${b.share}%`).join("、")}`}
            className="grid gap-x-4 gap-y-2 md:grid-cols-[8rem_1fr] md:items-center"
          >
            <span className="mono-text text-xl text-gray-300">{p.label}</span>
            <div>
              <div className="flex h-7 gap-0.5" aria-hidden="true">
                {p.byGroup.map((b) => (
                  <div
                    key={b.group}
                    className={`${groupBg[b.group]} first:rounded-l-[4px] last:rounded-r-[4px]`}
                    style={{ width: `${b.share}%` }}
                  />
                ))}
              </div>
              <div className="report-text flex justify-between gap-4 mt-1.5 text-xs md:text-sm text-gray-400" aria-hidden="true">
                {p.byGroup.map((b) => (
                  <span key={b.group} className="last:text-right">
                    {groups[b.group].label}
                    <span className="mono-text text-xl text-white mx-1.5">{b.share}%</span>
                    約{formatUsdM(b.loss)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <figcaption className="report-text text-sm text-gray-500">
          このページに掲載した{incidents.length}件の被害額（合計 約{formatUsdM(total)}）を、原因の大分類ごとに集計した。
        </figcaption>
      </figure>

      <div className="grid gap-10 md:grid-cols-2 md:gap-8 pt-6">
        {groupIds.map((g) => (
          <section key={g} aria-labelledby={`group-${g}`}>
            <div className={`border-l-4 ${groupBorder[g]} pl-4 mb-6`}>
              <h3 id={`group-${g}`} className="jp-text text-2xl text-white">
                {groups[g].label}
              </h3>
              <p className="report-text text-sm md:text-base text-gray-400 mt-2 leading-relaxed">
                {groups[g].description}
              </p>
            </div>
            <div className="space-y-8">
              {categories
                .filter((c) => c.group === g)
                .map((c) => {
                  const members = incidents
                    .filter((i) => i.category === c.id)
                    .sort((a, b) => b.lossUsdM - a.lossUsdM);
                  const loss = lossOf(members);
                  return (
                    <article key={c.id}>
                      <h4 className="jp-text text-xl text-white">{c.label}</h4>
                      <div className="flex items-center gap-3 mt-2" aria-hidden="true">
                        <div className="flex-1 h-2 bg-gray-800 rounded-[4px] overflow-hidden">
                          <div
                            className={`h-full ${groupBg[g]} rounded-r-[4px]`}
                            style={{ width: `${(loss / total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="report-text text-xs md:text-sm text-gray-500 mt-1">
                        全体の被害額の{percent(loss, total)}%・{members.length}件
                      </p>
                      <p className="report-text text-[15px] md:text-base text-gray-200 leading-[1.9] mt-3">
                        {c.description}
                      </p>
                      <p className="report-text text-[15px] md:text-base text-gray-400 leading-[1.9] mt-2">
                        典型的な流れ：{c.pattern}
                      </p>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        {members.map((m) => (
                          <li key={m.id}>
                            <a
                              href={`#${m.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                onSelect(m.id);
                              }}
                              className="jp-text text-base text-gray-300 underline decoration-dotted underline-offset-4 hover:text-white"
                            >
                              {m.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
