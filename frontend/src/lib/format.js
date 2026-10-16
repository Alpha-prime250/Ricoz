export const STAGES = ["applied", "screening", "interview", "assessment", "offer", "hired", "rejected"];

export const STAGE_LABEL = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

// What the "Status" column on the dashboard shows for each stage.
export const STAGE_STATUS = {
  applied: "New",
  screening: "In Review",
  interview: "Scheduled",
  assessment: "In Review",
  offer: "Sent",
  hired: "Completed",
  rejected: "Closed",
};

export const EMPLOYMENT_LABEL = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export const SOURCE_LABEL = {
  referral: "Referral",
  job_board: "Job Board",
  linkedin: "LinkedIn",
  career_site: "Career Site",
  agency: "Agency",
  other: "Other",
};

export function initials(name = "") {
  return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function fmtDate(d, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", opts);
}

export function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function relativeDay(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((dOnly - nowOnly) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1) return fmtDate(d, { month: "short", day: "numeric" });
  if (diff === -1) return "Yesterday";
  return fmtDate(d, { month: "short", day: "numeric" });
}

export function timeAgo(dateStr) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// Seeded jobs created before requisition IDs existed still get a stable-looking one.
export function requisitionId(job) {
  if (job.requisitionId) return job.requisitionId;
  return `JR-${new Date(job.createdAt || Date.now()).getFullYear()}-${String(job._id).slice(-4).toUpperCase()}`;
}

export function jobStatusLabel(job) {
  if (job.approvalStatus === "pending") return { key: "pending", label: "Pending Approval" };
  if (job.approvalStatus === "rejected") return { key: "rejected", label: "Rejected" };
  const map = { open: "Open", draft: "Draft", on_hold: "On Hold", closed: "Closed" };
  return { key: job.status, label: map[job.status] || job.status };
}

export function salaryRange(job) {
  if (!job.minSalary && !job.maxSalary) return "—";
  const f = (n) => Number(n).toLocaleString("en-IN");
  return `₹${f(job.minSalary || 0)} - ₹${f(job.maxSalary || 0)}`;
}
