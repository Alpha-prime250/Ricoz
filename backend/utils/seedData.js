const User = require("../models/User");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Offer = require("../models/Offer");

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const firstNames = [
  "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Arjun", "Kavya", "Rohan",
  "Isha", "Karan", "Meera", "Aditya", "Pooja", "Nikhil", "Divya", "Siddharth",
  "Neha", "Aman", "Ritika", "Varun", "Shreya", "Aakash", "Tanvi", "Harsh",
  "Simran", "Yash", "Aarushi", "Manish", "Kritika", "Dev", "Anjali", "Sahil",
  "Riya", "Gaurav", "Nisha", "Abhishek", "Swati", "Kunal", "Vidya", "Rajat",
  "Sanya", "Vivek", "Tanya", "Ashwin", "Monika", "Pranav", "Deepika", "Sameer",
  "Ishita", "Naveen",
];
const lastNames = [
  "Nair", "Mehta", "Sharma", "Reddy", "Verma", "Iyer", "Gupta", "Kapoor",
  "Menon", "Singh", "Rao", "Chopra", "Malhotra", "Joshi", "Patel", "Desai",
  "Bhatt", "Pillai", "Agarwal", "Bose",
];
const titles = [
  "Frontend Developer", "Backend Developer", "Full Stack Engineer", "Product Designer",
  "UX Researcher", "QA Engineer", "DevOps Engineer", "Data Analyst", "Data Scientist",
  "Product Manager", "Sales Executive", "Marketing Associate", "Content Writer",
  "HR Executive", "Customer Support Lead", "Mobile Developer", "ML Engineer",
];
const companies = [
  "TechNova", "Zenith Labs", "Bluewave Systems", "Nimbus IT", "Coral Digital",
  "Pixel Forge", "Orbit Analytics", "Vertex Solutions", "Skyline Softworks",
  "Quantum Retail", "Everline Media", "Northgate Finserv",
];
const cities = ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Delhi NCR", "Chennai", "Kolkata", "Remote"];
const sources = ["referral", "job_board", "linkedin", "career_site", "agency", "other"];
const skillPool = [
  "React", "Node.js", "JavaScript", "TypeScript", "Python", "Django", "MongoDB",
  "PostgreSQL", "AWS", "Docker", "Kubernetes", "Figma", "SQL", "Java", "Spring Boot",
  "Redux", "GraphQL", "CSS", "Salesforce", "SEO", "Excel", "Communication", "Leadership",
];

const jobDefs = [
  { title: "Frontend Engineer (React)", department: "Engineering", skills: ["React", "JavaScript", "CSS"] },
  { title: "Backend Engineer (Node.js)", department: "Engineering", skills: ["Node.js", "MongoDB", "AWS"] },
  { title: "Product Designer", department: "Design", skills: ["Figma", "CSS"] },
  { title: "QA Automation Engineer", department: "Engineering", skills: ["JavaScript", "SQL"] },
  { title: "Data Analyst", department: "Data", skills: ["SQL", "Excel", "Python"] },
  { title: "Product Manager", department: "Product", skills: ["Communication", "Leadership"] },
  { title: "Sales Executive", department: "Sales", skills: ["Salesforce", "Communication"] },
  { title: "Marketing Associate", department: "Marketing", skills: ["SEO", "Communication"] },
];

/**
 * Wipes and re-seeds the database. Assumes mongoose is already connected —
 * caller is responsible for connecting/disconnecting (or, for the API route,
 * leaving the shared server connection alone).
 */
async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Candidate.deleteMany({}),
    Application.deleteMany({}),
    Interview.deleteMany({}),
    Offer.deleteMany({}),
  ]);

  // --- Users ---
  const admin = await User.create({
    name: "Asha Verma",
    email: "admin@ricozrecruit.com",
    password: "password123",
    role: "admin",
    department: "HR",
  });

  const hiringManager = await User.create({
    name: "Vikram Rao",
    email: "hiringmanager@ricozrecruit.com",
    password: "password123",
    role: "hiring_manager",
    department: "Engineering",
  });

  const recruiter = await User.create({
    name: "Rahul Mehta",
    email: "recruiter@ricozrecruit.com",
    password: "password123",
    role: "recruiter",
    department: "Talent Acquisition",
  });

  // --- Jobs (mostly approved/open, a couple pending for the approval demo) ---
  const jobs = [];
  for (let i = 0; i < jobDefs.length; i++) {
    const def = jobDefs[i];
    const pending = i >= jobDefs.length - 2; // last 2 stay pending approval
    const job = await Job.create({
      title: def.title,
      department: def.department,
      location: rand(cities),
      employmentType: "full_time",
      openings: randInt(1, 3),
      minSalary: randInt(6, 12) * 100000,
      maxSalary: randInt(14, 24) * 100000,
      description: `We're hiring a ${def.title} to join our ${def.department} team and help us scale.`,
      requirements: ["Relevant experience in the field", "Strong communication skills"],
      skills: def.skills,
      requestedBy: recruiter._id,
      approvalStatus: pending ? "pending" : "approved",
      approvedBy: pending ? undefined : admin._id,
      status: pending ? "draft" : "open",
    });
    jobs.push(job);
  }

  // --- 50 Candidates ---
  const usedEmails = new Set();
  const candidates = [];
  for (let i = 0; i < 50; i++) {
    const first = rand(firstNames);
    const last = rand(lastNames);
    let email = `${first}.${last}${i}@example.com`.toLowerCase();
    while (usedEmails.has(email)) email = `${first}.${last}${i}${randInt(1, 999)}@example.com`.toLowerCase();
    usedEmails.add(email);

    const skills = Array.from(new Set([rand(skillPool), rand(skillPool), rand(skillPool)]));

    const candidate = await Candidate.create({
      name: `${first} ${last}`,
      email,
      phone: `+91-9${randInt(100000000, 999999999)}`,
      source: rand(sources),
      currentTitle: rand(titles),
      currentCompany: rand(companies),
      experienceYears: randInt(0, 12),
      skills,
      location: rand(cities),
      addedBy: recruiter._id,
    });
    candidates.push(candidate);
  }

  // --- Applications: spread candidates across open jobs & pipeline stages ---
  const openJobs = jobs.filter((j) => j.status === "open");
  const stageWeights = [
    "applied", "applied", "applied",
    "screening", "screening", "screening",
    "interview", "interview",
    "assessment",
    "offer",
    "hired",
    "rejected", "rejected",
  ];

  const applications = [];
  for (const candidate of candidates) {
    const job = rand(openJobs);
    const stage = rand(stageWeights);

    const stageHistory = [{ stage: "applied", changedBy: recruiter._id }];
    if (stage !== "applied") stageHistory.push({ stage: "screening", changedBy: recruiter._id, note: "Resume shortlisted" });
    if (["interview", "assessment", "offer", "hired"].includes(stage)) {
      stageHistory.push({ stage: "interview", changedBy: recruiter._id, note: "Interview scheduled" });
    }
    if (["assessment", "offer", "hired"].includes(stage)) {
      stageHistory.push({ stage: "assessment", changedBy: recruiter._id });
    }
    if (["offer", "hired"].includes(stage)) {
      stageHistory.push({ stage: "offer", changedBy: recruiter._id, note: "Offer extended" });
    }
    if (stage === "hired") {
      stageHistory.push({ stage: "hired", changedBy: recruiter._id, note: "Offer accepted" });
    }
    if (stage === "rejected") {
      stageHistory.push({ stage: "rejected", changedBy: recruiter._id, note: "Not a fit at this time" });
    }

    try {
      const application = await Application.create({
        job: job._id,
        candidate: candidate._id,
        stage,
        stageHistory,
        rejectionReason: stage === "rejected" ? "Skills mismatch for the role" : "",
        rating: randInt(2, 5),
      });
      applications.push(application);
    } catch (e) {
      // skip rare duplicate (candidate, job) pairs from the unique index
    }
  }

  // --- Interviews for anyone past the "interview" stage ---
  const interviewables = applications.filter((a) =>
    ["interview", "assessment", "offer", "hired"].includes(a.stage)
  );
  for (const app of interviewables) {
    await Interview.create({
      application: app._id,
      round: "Round 1",
      type: rand(["phone_screen", "technical", "panel", "hr"]),
      scheduledAt: daysFromNow(randInt(-10, 10)),
      durationMinutes: rand([30, 45, 60]),
      interviewers: [hiringManager._id, recruiter._id],
      location: rand(["Google Meet", "Zoom", "On-site — Bengaluru office"]),
      status: app.stage === "interview" ? "scheduled" : "completed",
      feedback: app.stage === "interview" ? "" : "Solid technical fundamentals, good communication.",
      score: app.stage === "interview" ? undefined : randInt(6, 10),
      recommendation: app.stage === "interview" ? "" : rand(["yes", "strong_yes", "neutral"]),
    });
  }

  // --- Offers for anyone in "offer" or "hired" stage ---
  const offerables = applications.filter((a) => ["offer", "hired"].includes(a.stage));
  for (const app of offerables) {
    const status = app.stage === "hired" ? "accepted" : rand(["draft", "sent"]);
    await Offer.create({
      application: app._id,
      proposedTitle: rand(titles),
      salary: randInt(8, 22) * 100000,
      bonus: randInt(0, 2) * 50000,
      startDate: daysFromNow(randInt(14, 45)),
      expiresAt: daysFromNow(randInt(5, 14)),
      status,
      approvedBy: admin._id,
      createdBy: recruiter._id,
      communications:
        status === "draft"
          ? []
          : [
              {
                channel: "email",
                subject: "Your offer from RicozRecruit",
                message: "We're excited to extend this offer — details attached. Let us know if you have questions!",
                sentBy: recruiter._id,
              },
            ],
    });
  }

  return {
    jobs: jobs.length,
    candidates: candidates.length,
    applications: applications.length,
    interviews: interviewables.length,
    offers: offerables.length,
  };
}

module.exports = { seedDatabase };
