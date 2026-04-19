const connectToDatabase = require('./_db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
    const db = await connectToDatabase();
    const announcements = db.collection('announcements');

    if (req.method === 'GET') {
        const all = await announcements.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(all);
    }

    if (req.method === 'POST') {
        const announcement = { ...req.body, createdAt: new Date() };
        await announcements.insertOne(announcement);
        return res.status(201).json({ message: 'Announcement posted' });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await announcements.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: 'Announcement deleted' });
    }

    res.status(405).send('Method Not Allowed');
};
