/** 百万ドル単位の金額を「14.6億ドル」「4,800万ドル」の形にする */
export function formatUsdM(m: number): string {
  if (m >= 100) {
    return `${(m / 100).toFixed(1).replace(/\.0$/, "")}億ドル`;
  }
  return `${(m * 100).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万ドル`;
}

/** YYYY-MM-DD を「2025年2月21日」にする */
export function formatDateJa(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
