import jwt from 'jsonwebtoken';

const foodAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", token_decode);
        req.user = { id: token_decode.id };  // Attach the user ID to req.user instead of req.body
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired. Login Again.' });
    }
}

export default foodAuthMiddleware;