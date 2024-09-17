// middleware/foodAuth.js

import jwt from 'jsonwebtoken';

const foodAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Log the header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authorization header missing or incorrect');
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // Log the token

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', token_decode); // Log the decoded token
    req.user = { id: token_decode.id }; // Attach the user ID to req.user
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Token is invalid or expired. Login Again.' });
  }
};

export default foodAuthMiddleware;
