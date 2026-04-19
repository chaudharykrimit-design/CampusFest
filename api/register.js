const connectToDatabase = require('./_db');

module.exports = async (req, res) => {
    const db = await connectToDatabase();
    const registrations = db.collection('registrations');
    const scoreboard = db.collection('scoreboard');

    if (req.method === 'POST') {
        const registration = { ...req.body, createdAt: new Date() };
        await registrations.insertOne(registration);

        // Update house points
        if (registration.house) {
            await scoreboard.updateOne(
                { houseName: registration.house },
                { $inc: { points: 10 } },
                { upsert: true }
            );
        }

        return res.status(201).json({ message: 'Registration successful' });
    }

    if (req.method === 'GET') {
        const all = await registrations.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(all);
    }

    res.status(405).send('Method Not Allowed');
};
