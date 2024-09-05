import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;  // Access the authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
    }

    const token = authHeader.split(' ')[1];  // Extract the token by splitting the "Bearer" keyword

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", token_decode);
        req.body.userId = token_decode.id;  // Attach the user ID to the request body
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired. Login Again.' });
    }
}

export default authMiddleware;