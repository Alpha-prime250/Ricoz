import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="rz-pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={14} /></button>
      {nums.map((n) => (
        <button key={n} className={n === page ? "active" : ""} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={14} /></button>
    </div>
  );
}
