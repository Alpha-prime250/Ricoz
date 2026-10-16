// All landing page copy lives here so it is easy to edit.

export const lifecycle = [
  {
    title: "Open a requisition",
    body: "Raise a job requisition with department, headcount and budget. An admin or hiring manager approves or rejects it before the job goes live.",
    tag: "Requisitions",
  },
  {
    title: "Source and screen candidates",
    body: "Add candidates from referrals, LinkedIn, job boards, agencies or your career site, search them by skill, and move each one through a pipeline board for the job.",
    tag: "Candidates",
  },
  {
    title: "Interview with a record",
    body: "Schedule phone screens, technical, assessment, panel, HR and final rounds, assign interviewers, and collect feedback with a clear recommendation.",
    tag: "Interviews",
  },
  {
    title: "Make and track the offer",
    body: "Create an offer from the application, log every email, call and note to the candidate, and see whether it was accepted or declined.",
    tag: "Offers",
  },
];

export const stages = [
  { name: "Applied", people: ["Aarav M.", "Sneha K.", "Rohit P."] },
  { name: "Screening", people: ["Meera S.", "Kabir T."] },
  { name: "Interview", people: ["Ananya R.", "Dev N."] },
  { name: "Assessment", people: ["Ishaan V."] },
  { name: "Offer", people: ["Tara B."] },
  { name: "Hired", people: ["Nikhil J."] },
];

export const details = [
  "A job only opens after it has been approved",
  "Search the candidate list by skill",
  "Submitting interview feedback moves the pipeline stage forward",
  "Accepting an offer marks the candidate as hired",
  "Email, call and note history is kept on every offer",
  "Light and dark themes, usable on a phone",
];

export const roles = [
  {
    role: "Recruiter",
    does: "Creates requisitions, sources candidates, manages the pipeline, schedules interviews and drafts offers.",
  },
  {
    role: "Hiring manager",
    does: "Approves or rejects requisitions and follows candidates for their roles through each stage.",
  },
  {
    role: "Admin",
    does: "Full access: everything above, plus deleting jobs and resetting the demo data.",
  },
];

export const faqs = [
  {
    q: "What is RicozRecruit?",
    a: "A recruiting workspace that covers requisitions and approvals, candidate sourcing and pipeline, interview scheduling with feedback, and offer management.",
  },
  {
    q: "Who is it for?",
    a: "Recruiters, hiring managers and HR admins working in one team. Each role signs in with its own account and sees the same shared pipeline.",
  },
  {
    q: "Can I try it without setting anything up?",
    a: "Yes. Sign in with the demo account to open a workspace with sample jobs, candidates, interviews and offers already in it.",
  },
  {
    q: "What does each role get to do?",
    a: "Recruiters run the day-to-day pipeline. Hiring managers and admins approve or reject requisitions. Only admins can delete jobs.",
  },
  {
    q: "Can I reset the sample data?",
    a: "Admins can reset it from the sidebar. It wipes everything and re-creates the same fresh sample data, so you will be signed out afterwards.",
  },
];
