const connectToDatabase = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { name, email, password } = req.body;
    const db = await connectToDatabase();
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'student',
        createdAt: new Date()
    });

    res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
};
