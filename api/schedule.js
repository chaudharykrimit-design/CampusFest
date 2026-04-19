const connectToDatabase = require('./_db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
    const db = await connectToDatabase();
    const schedule = db.collection('schedule');

    if (req.method === 'GET') {
        const all = await schedule.find({}).sort({ time: 1 }).toArray();
        return res.status(200).json(all);
    }

    if (req.method === 'POST') {
        const item = { ...req.body, createdAt: new Date() };
        await schedule.insertOne(item);
        return res.status(201).json({ message: 'Schedule item added' });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await schedule.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: 'Schedule item deleted' });
    }

    res.status(405).send('Method Not Allowed');
};
