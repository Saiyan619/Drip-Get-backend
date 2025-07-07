const adminMiddleware = (req, res, next) => {
  if (req.user.publicMetadata.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = adminMiddleware;