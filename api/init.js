const connectToDatabase = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const users = db.collection('users');

        const adminEmail = "chaudharykrimit@gmail.com";
        const existingAdmin = await users.findOne({ email: adminEmail });

        if (existingAdmin) {
            return res.status(200).json({ message: "Admin account already exists." });
        }

        const hashedPassword = await bcrypt.hash("krimit1718", 10);
        await users.insertOne({
            name: "Krimit (Admin)",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            createdAt: new Date()
        });

        // Initialize Scoreboard as well
        const scoreboard = db.collection('scoreboard');
        const count = await scoreboard.countDocuments();
        if (count === 0) {
            await scoreboard.insertMany([
                { houseName: 'Agni', points: 0 },
                { houseName: 'Vayu', points: 0 },
                { houseName: 'Jal', points: 0 },
                { houseName: 'Prithvi', points: 0 },
                { houseName: 'Antriksh', points: 0 }
            ]);
        }

        res.status(200).json({ message: "Project Initialized Successfully! Admin account created." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
