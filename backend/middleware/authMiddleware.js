import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;
    console.log('Auth middleware - Headers:', req.headers);
    console.log('Auth middleware - Authorization:', req.headers.authorization);
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token.substring(0, 20) + '...');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified, user ID:', decoded.id);
            
            req.user = await User.findById(decoded.id).select('-password');
            console.log('User found:', req.user?._id);
            
            next();
        } catch (error) {
            console.error('Auth error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.warn('No Bearer token provided');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default protect;