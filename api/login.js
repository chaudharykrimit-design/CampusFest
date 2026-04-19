const connectToDatabase = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, password } = req.body;
    
    try {
        const db = await connectToDatabase();
        const users = db.collection('users');

        // AUTO-INIT: If this is the admin email and no users exist, create the admin
        const adminEmail = "chaudharykrimit@gmail.com";
        const userCount = await users.countDocuments();
        
        if (userCount === 0 && email === adminEmail) {
            const hashedPassword = await bcrypt.hash("krimit1718", 10);
            await users.insertOne({
                name: "Krimit (Admin)",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                createdAt: new Date()
            });
            // Also init scoreboard
            const scoreboard = db.collection('scoreboard');
            await scoreboard.insertMany([
                { houseName: 'Agni', points: 0 }, { houseName: 'Vayu', points: 0 },
                { houseName: 'Jal', points: 0 }, { houseName: 'Prithvi', points: 0 },
                { houseName: 'Antriksh', points: 0 }
            ]);
        }

        const user = await users.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found. Please Sign Up first.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: "Database Connection Error: " + err.message });
    }
};
