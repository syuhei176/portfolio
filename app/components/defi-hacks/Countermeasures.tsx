import { layers, type Coverage } from "~/lib/defi-hacks/countermeasures";
import { categories, groupBg, type Incident } from "~/lib/defi-hacks/taxonomy";


const coverageMark: Record<Coverage, { mark: string; label: string }> = {
  2: { mark: "●", label: "主な予防策" },
  1: { mark: "○", label: "部分的に効く・被害を抑える" },
};

export function Countermeasures({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect: (id: string) => void;
}) {
  const nameById = Object.fromEntries(incidents.map((i) => [i.id, i.name]));

  return (
    <div className="space-y-12">
      <div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="report-text w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">対策と攻撃手法の対応表</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-[#0f0f1e] text-left font-normal text-gray-400 pb-3 pr-4 align-bottom min-w-[12rem]"
                >
                  対策
                </th>
                {categories.map((c) => (
                  <th key={c.id} scope="col" className="font-normal text-gray-300 pb-3 px-1 w-[4.5rem] align-bottom">
                    {c.short}
                    <span className={`block h-1 mt-2 ${groupBg[c.group]}`} aria-hidden="true" />
                  </th>
                ))}
              </tr>
            </thead>
            {layers.map((layer) => (
              <tbody key={layer.id}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={categories.length + 1}
                    className="jp-text text-left font-normal text-gray-400 pt-5 pb-2 border-b border-gray-700"
                  >
                    <span className="sticky left-0">{layer.label}</span>
                  </th>
                </tr>
                {layer.measures.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800">
                    <th scope="row" className="sticky left-0 z-10 bg-[#0f0f1e] text-left font-normal py-2 pr-4">
                      <a
                        href={`#measure-${m.id}`}
                        className="text-gray-200 hover:text-white underline decoration-dotted underline-offset-4"
                      >
                        {m.title}
                      </a>
                    </th>
                    {categories.map((c) => {
                      const cov = m.coverage[c.id];
                      return (
                        <td key={c.id} className="text-center py-2 text-lg text-gray-200">
                          {cov ? (
                            <span title={coverageMark[cov].label}>
                              <span aria-hidden="true">{coverageMark[cov].mark}</span>
                              <span className="sr-only">{coverageMark[cov].label}</span>
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <p className="report-text text-sm text-gray-400 mt-4">
          ● 主な予防策　○ 部分的に効く・被害を抑える
        </p>
      </div>

      {layers.map((layer) => (
        <section key={layer.id} aria-labelledby={`layer-${layer.id}`}>
          <h3 id={`layer-${layer.id}`} className="jp-text text-2xl text-white mb-6">
            {layer.label}
          </h3>
          <div className="space-y-8">
            {layer.measures.map((m) => (
              <article key={m.id} id={`measure-${m.id}`} className="scroll-mt-6 max-w-[46rem]">
                <h4 className="jp-text text-xl text-gray-100">{m.title}</h4>
                <p className="report-text text-[15px] md:text-base text-gray-300 leading-[1.9] mt-2">
                  {m.detail}
                </p>
                <p className="report-text text-sm text-gray-500 mt-2">
                  関連する事件：
                  {m.incidents.map((id, i) => (
                    <span key={id}>
                      {i > 0 && "、"}
                      <a
                        href={`#${id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelect(id);
                        }}
                        className="text-gray-300 underline decoration-dotted underline-offset-4 hover:text-white"
                      >
                        {nameById[id] ?? id}
                      </a>
                    </span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
