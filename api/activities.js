const connectToDatabase = require('./_db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
    const db = await connectToDatabase();
    const activities = db.collection('activities');

    if (req.method === 'GET') {
        const all = await activities.find({}).sort({ date: 1 }).toArray();
        return res.status(200).json(all);
    }

    if (req.method === 'POST') {
        const activity = { ...req.body, createdAt: new Date() };
        await activities.insertOne(activity);
        return res.status(201).json({ message: 'Activity added' });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await activities.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: 'Activity deleted' });
    }

    res.status(405).send('Method Not Allowed');
};
