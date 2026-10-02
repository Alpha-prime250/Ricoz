require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { seedDatabase } = require("./utils/seedData");

const run = async () => {
  await connectDB();
  const summary = await seedDatabase();

  console.log(`Seed data created: ${summary.jobs} jobs, ${summary.candidates} candidates, ${summary.applications} applications`);
  console.log(`  ${summary.interviews} interviews, ${summary.offers} offers`);
  console.log("Logins:");
  console.log("  admin@ricozrecruit.com / password123 (admin)");
  console.log("  hiringmanager@ricozrecruit.com / password123 (hiring_manager)");
  console.log("  recruiter@ricozrecruit.com / password123 (recruiter)");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
