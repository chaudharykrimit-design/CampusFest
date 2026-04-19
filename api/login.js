const connectToDatabase = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, password } = req.body;
    const db = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    // In a real app, you'd generate a JWT here. 
    // For this simple project, we'll return user info.
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
