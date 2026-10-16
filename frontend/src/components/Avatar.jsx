import { initials } from "@/lib/format";

export default function Avatar({ name, size = 34 }) {
  return (
    <span className="rz-avatar" style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}>
      {initials(name) || "?"}
    </span>
  );
}
