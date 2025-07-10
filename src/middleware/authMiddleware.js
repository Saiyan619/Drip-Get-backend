const { verifyToken, users } = require('@clerk/clerk-sdk-node');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 🛠️ Pass Clerk secret key explicitly
    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Fetch user
    const user = await users.getUser(session.sub);

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
module.exports = authMiddleware;
