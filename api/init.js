const connectToDatabase = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const users = db.collection('users');
        const activities = db.collection('activities');
        const scoreboard = db.collection('scoreboard');

        // Initialize Admin
        const adminEmail = "chaudharykrimit@gmail.com";
        const existingAdmin = await users.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("krimit1718", 10);
            await users.insertOne({
                name: "Krimit (Admin)",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                createdAt: new Date()
            });
        }

        // Initialize Scoreboard
        const count = await scoreboard.countDocuments();
        if (count === 0) {
            await scoreboard.insertMany([
                { houseName: 'Agni', points: 450 },
                { houseName: 'Vayu', points: 380 },
                { houseName: 'Jal', points: 410 },
                { houseName: 'Prithvi', points: 390 },
                { houseName: 'Antriksh', points: 425 }
            ]);
        }

        // Seed 25+ Activities
        await activities.deleteMany({}); // Clear old ones
        const activityList = [
            { title: "Cricket Championship", description: "Inter-house 11-side cricket tournament.", date: "2026-05-10", type: "Sports" },
            { title: "Football League", description: "High-intensity football matches on the main ground.", date: "2026-05-11", type: "Sports" },
            { title: "Basketball Shootout", description: "Fast-paced 3v3 basketball competition.", date: "2026-05-12", type: "Sports" },
            { title: "Chess Grandmaster", description: "Strategic board battles for the ultimate title.", date: "2026-05-10", type: "Sports" },
            { title: "Badminton Singles", description: "Knockout badminton tournament in the indoor court.", date: "2026-05-13", type: "Sports" },
            { title: "Table Tennis", description: "Fast-reacting table tennis matches.", date: "2026-05-13", type: "Sports" },
            { title: "Volleyball Smash", description: "Spiking competition on the sand court.", date: "2026-05-14", type: "Sports" },
            { title: "Athletics 100m Dash", description: "The fastest sprinters compete for gold.", date: "2026-05-15", type: "Sports" },
            { title: "Tug of War", description: "Ultimate test of strength and teamwork.", date: "2026-05-15", type: "Sports" },
            { title: "Kabaddi Tournament", description: "Traditional power-packed kabaddi matches.", date: "2026-05-16", type: "Sports" },
            
            { title: "Solo Dance Battle", description: "Express yourself through modern and classical dance.", date: "2026-05-11", type: "Cultural" },
            { title: "Battle of Bands", description: "Rock the stage with your musical talent.", date: "2026-05-12", type: "Cultural" },
            { title: "Fashion Show", description: "The grand theme-based runway walk.", date: "2026-05-17", type: "Cultural" },
            { title: "Drama & Skit", description: "Captivate the audience with your acting skills.", date: "2026-05-14", type: "Cultural" },
            { title: "Classical Singing", description: "Melodic voices competing in traditional styles.", date: "2026-05-13", type: "Cultural" },
            { title: "Stand-up Comedy", description: "Bring the house down with your humor.", date: "2026-05-16", type: "Cultural" },
            { title: "Face Painting", description: "Artistic expression on the human canvas.", date: "2026-05-10", type: "Cultural" },
            { title: "Photography Contest", description: "Capture the festival's best moments.", date: "2026-05-18", type: "Cultural" },
            { title: "Rangoli Art", description: "Traditional patterns and colors on the floor.", date: "2026-05-10", type: "Cultural" },
            { title: "Mime Act", description: "Silent storytelling through movement.", date: "2026-05-15", type: "Cultural" },

            { title: "Hackathon 2026", description: "24-hour coding challenge to solve real-world problems.", date: "2026-05-12", type: "Technical" },
            { title: "Robo-War", description: "Combat robots battling for supremacy.", date: "2026-05-14", type: "Technical" },
            { title: "Code Debugging", description: "Find and fix bugs in complex codebases.", date: "2026-05-11", type: "Technical" },
            { title: "Quiz Master", description: "The ultimate test of general knowledge.", date: "2026-05-10", type: "Technical" },
            { title: "Web Design Battle", description: "Build the most stunning website in 3 hours.", date: "2026-05-13", type: "Technical" },
            { title: "App Development", description: "Pitch and build innovative mobile applications.", date: "2026-05-15", type: "Technical" },
            { title: "E-Sports (Valorant)", description: "High-stakes competitive tactical shooter tournament.", date: "2026-05-16", type: "Technical" }
        ];
        await activities.insertMany(activityList.map(a => ({ ...a, createdAt: new Date() })));

        res.status(200).json({ message: "Project Re-Initialized! 27 Activities added." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
