// All copy for the landing page lives here so it is easy to edit.
// Franchise facts come from Ricoz's public FranchiseIndia listing.
// Check them against https://ricoz.in/franchise/ before publishing.

export const FRANCHISE_URL = "https://ricoz.in/franchise/";

export const lifecycle = [
  {
    title: "Open a requisition",
    body: "Raise a job requisition with department, headcount and budget. Admins and hiring managers approve or reject it before the job goes live.",
    tag: "Requisitions",
  },
  {
    title: "Source and screen candidates",
    body: "Add candidates from referrals, LinkedIn or job boards, search by skill, and move each one through a pipeline board for the job.",
    tag: "Candidates",
  },
  {
    title: "Interview with a record",
    body: "Schedule phone screens, technical, panel, HR and final rounds, assign interviewers, and collect feedback with a recommendation.",
    tag: "Interviews",
  },
  {
    title: "Make and track the offer",
    body: "Create an offer from the application, log every email, call and note to the candidate, and see accepted or declined at a glance.",
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

export const roles = [
  { role: "Recruiter", does: "Adds candidates, applies them to jobs, moves them through stages, schedules interviews and drafts offers." },
  { role: "Hiring manager", does: "Approves or rejects requisitions, reviews candidates on the pipeline and submits interview feedback." },
  { role: "Admin", does: "Everything above, plus removing jobs and resetting the demo workspace." },
];

export const franchiseFacts = [
  { label: "Founded", value: "2021" },
  { label: "Franchising since", value: "2025" },
  { label: "Investment", value: "₹2–5 lakh" },
  { label: "Space needed", value: "1,200–1,300 sq ft" },
  { label: "Category", value: "Digital marketing services" },
  { label: "Outlets today", value: "Fewer than 10" },
];

export const franchiseStates = ["Delhi", "Haryana", "Himachal Pradesh"];

export const franchiseSteps = [
  { title: "Send an enquiry", body: "Tell us your city, how much you plan to invest and anything you want to know." },
  { title: "Talk through the fit", body: "The Ricoz team gets back to you about your location, investment and what the partnership involves." },
  { title: "Set up and launch", body: "Agree the terms, set up your space and open as a Ricoz partner." },
];

export const faqs = [
  {
    q: "What is RicozRecruit?",
    a: "A recruiting workspace that covers requisitions and approvals, candidate sourcing and pipeline, interview scheduling with feedback, and offer management.",
  },
  {
    q: "Who is it for?",
    a: "Recruiters, hiring managers and HR admins in one team. Each role signs in with its own account and sees the same shared pipeline.",
  },
  {
    q: "Can I try it without setting anything up?",
    a: "Yes. Use the demo login on the sign-in page. It opens a workspace with sample jobs, candidates, interviews and offers.",
  },
  {
    q: "How much does a Ricoz franchise cost?",
    a: "The public listing shows an investment of ₹2–5 lakh and a space of 1,200–1,300 sq ft. Send an enquiry for the exact terms for your city.",
  },
  {
    q: "Which locations is Ricoz expanding to?",
    a: "The listing names Delhi, Haryana and Himachal Pradesh and 33 more locations. If your city isn't named, enquire anyway.",
  },
  {
    q: "Where can I read the full franchise details?",
    a: "On the Ricoz franchise page at ricoz.in/franchise.",
  },
];