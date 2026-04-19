const connectToDatabase = require('./_db');

module.exports = async (req, res) => {
    const db = await connectToDatabase();
    const scoreboard = db.collection('scoreboard');

    if (req.method === 'GET') {
        const all = await scoreboard.find({}).sort({ points: -1 }).toArray();
        return res.status(200).json(all);
    }

    if (req.method === 'POST') {
        const { houseName, points } = req.body;
        await scoreboard.updateOne(
            { houseName },
            { $set: { points: parseInt(points) } },
            { upsert: true }
        );
        return res.status(200).json({ message: 'Score updated' });
    }

    res.status(405).send('Method Not Allowed');
};
