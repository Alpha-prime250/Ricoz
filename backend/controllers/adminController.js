const { seedDatabase } = require("../utils/seedData");

// POST /api/admin/reset-demo-data — admin only.
// Wipes every collection and re-seeds fresh demo data. Because this also
// deletes and recreates all users (including whoever is calling it), the
// caller's current JWT will stop resolving to a user afterwards — the
// frontend should expect a forced logout and send people back to the
// (freshly reseeded) login credentials.
exports.resetDemoData = async (req, res, next) => {
  try {
    const summary = await seedDatabase();
    res.json({
      message: "Demo data reset",
      summary,
      logins: [
        { email: "admin@ricozrecruit.com", password: "password123", role: "admin" },
        { email: "hiringmanager@ricozrecruit.com", password: "password123", role: "hiring_manager" },
        { email: "recruiter@ricozrecruit.com", password: "password123", role: "recruiter" },
      ],
    });
  } catch (err) {
    next(err);
  }
};
