import {
  categories,
  categoryById,
  groupBg,
  targetLabels,
  type CategoryId,
  type Incident,
  type TargetType,
} from "~/lib/defi-hacks/taxonomy";
import { formatUsdM } from "~/lib/defi-hacks/format";

export type SortKey = "newest" | "oldest" | "loss";

export interface Filters {
  category: CategoryId | null;
  target: TargetType | null;
  sort: SortKey;
}

export const defaultFilters: Filters = { category: null, target: null, sort: "newest" };

export function matchesFilters(incident: Incident, filters: Filters) {
  return (
    (filters.category === null || incident.category === filters.category) &&
    (filters.target === null || incident.target === filters.target)
  );
}


const sorters: Record<SortKey, (a: Incident, b: Incident) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date),
  oldest: (a, b) => a.date.localeCompare(b.date),
  loss: (a, b) => b.lossUsdM - a.lossUsdM,
};

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`report-text text-sm px-3 py-1.5 border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        pressed
          ? "border-white bg-white text-[#0f0f1e]"
          : "border-gray-600 text-gray-300 hover:border-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function CategoryBadge({ id }: { id: CategoryId }) {
  const category = categoryById[id];
  return (
    <span className="inline-flex items-center gap-1.5 report-text text-xs md:text-sm text-gray-300 whitespace-nowrap">
      <span className={`w-2.5 h-2.5 ${groupBg[category.group]}`} aria-hidden="true" />
      {category.short}
    </span>
  );
}

function IncidentDetail({ incident }: { incident: Incident }) {
  const rows: [string, React.ReactNode][] = [
    ["何が起きたか", incident.mechanism],
    ["根本原因", incident.rootCause],
    [
      "その後",
      <>
        {incident.aftermath}
        {incident.recovered && <span className="block mt-1">回収：{incident.recovered}</span>}
        {incident.attribution && (
          <span className="block mt-1">攻撃者：{incident.attribution}</span>
        )}
      </>,
    ],
    ["教訓", incident.lesson],
  ];
  return (
    <div className="report-text text-[15px] md:text-base leading-[1.9] text-gray-200 px-4 md:px-6 pb-6 pt-2">
      <dl className="grid gap-x-6 gap-y-4 md:grid-cols-[7.5rem_1fr] max-w-[46rem]">
        {rows.map(([label, body]) => (
          <div key={label} className="contents">
            <dt className="jp-text text-gray-400">{label}</dt>
            <dd className="m-0">{body}</dd>
          </div>
        ))}
        {incident.lossNote && (
          <div className="contents">
            <dt className="jp-text text-gray-400">被害額の注記</dt>
            <dd className="m-0">{incident.lossNote}</dd>
          </div>
        )}
        <div className="contents">
          <dt className="jp-text text-gray-400">出典</dt>
          <dd className="m-0">
            <ul className="space-y-1">
              {incident.sources.map((s) => (
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
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function IncidentFiles({
  incidents,
  filters,
  onFiltersChange,
  openIds,
  onToggle,
}: {
  incidents: Incident[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  openIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const visible = incidents.filter((i) => matchesFilters(i, filters)).sort(sorters[filters.sort]);
  const visibleTotal = visible.reduce((sum, i) => sum + i.lossUsdM, 0);
  const targets = Object.keys(targetLabels) as TargetType[];

  return (
    <div>
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="攻撃手法で絞り込む">
          <Chip
            pressed={filters.category === null}
            onClick={() => onFiltersChange({ ...filters, category: null })}
          >
            すべての手法
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              pressed={filters.category === c.id}
              onClick={() => onFiltersChange({ ...filters, category: c.id })}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 ${groupBg[c.group]}`} aria-hidden="true" />
                {c.short}
              </span>
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="標的で絞り込む">
            <Chip
              pressed={filters.target === null}
              onClick={() => onFiltersChange({ ...filters, target: null })}
            >
              すべての標的
            </Chip>
            {targets.map((t) => (
              <Chip
                key={t}
                pressed={filters.target === t}
                onClick={() => onFiltersChange({ ...filters, target: t })}
              >
                {targetLabels[t]}
              </Chip>
            ))}
          </div>
          <label className="report-text text-sm text-gray-400 flex items-center gap-2 md:ml-auto">
            並べ替え
            <select
              value={filters.sort}
              onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as SortKey })}
              className="report-text text-sm bg-[#1a1a2e] text-gray-200 border-2 border-gray-600 px-2 py-1.5"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="loss">被害額が大きい順</option>
            </select>
          </label>
        </div>
        <p className="report-text text-sm text-gray-400" aria-live="polite">
          {incidents.length}件中 {visible.length}件を表示。被害額の合計は約{formatUsdM(visibleTotal)}。
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="report-text border-2 border-dashed border-gray-700 p-6 text-gray-300">
          この組み合わせに当てはまる事件はありません。
          <button
            type="button"
            onClick={() => onFiltersChange(defaultFilters)}
            className="ml-2 underline underline-offset-4 text-cyan-300"
          >
            絞り込みを解除する
          </button>
        </div>
      ) : (
        <ul className="border-t-2 border-gray-700">
          {visible.map((incident) => {
            const open = openIds.has(incident.id);
            return (
              <li
                key={incident.id}
                id={incident.id}
                className="border-b-2 border-gray-800 scroll-mt-6"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${incident.id}-detail`}
                  onClick={() => onToggle(incident.id)}
                  className={`w-full text-left px-4 md:px-6 py-4 grid gap-x-4 gap-y-1 grid-cols-[1fr_auto] md:grid-cols-[6.5rem_1fr_7rem_7.5rem_1.5rem] md:items-baseline hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
                    open ? "bg-white/5" : ""
                  }`}
                >
                  <span className="mono-text text-lg text-gray-400 md:order-none">
                    {incident.date}
                  </span>
                  <span className="jp-text text-lg text-white text-right whitespace-nowrap md:order-4">
                    {formatUsdM(incident.lossUsdM)}
                  </span>
                  <span className="col-span-2 md:col-span-1 md:order-2">
                    <span className="jp-text text-lg md:text-xl text-white">{incident.name}</span>
                    <span className="report-text text-xs md:text-sm text-gray-400 ml-2">
                      {targetLabels[incident.target]}・{incident.chain}
                    </span>
                    <span className="report-text block text-sm text-gray-400 mt-1 leading-relaxed">
                      {incident.summary}
                    </span>
                  </span>
                  <span className="col-span-2 md:col-span-1 md:order-3">
                    <CategoryBadge id={incident.category} />
                  </span>
                  <span
                    className="hidden md:block md:order-5 mono-text text-xl text-gray-400"
                    aria-hidden="true"
                  >
                    {open ? "-" : "+"}
                  </span>
                </button>
                <div id={`${incident.id}-detail`} hidden={!open}>
                  <IncidentDetail incident={incident} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
