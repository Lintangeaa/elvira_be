module.exports = {
  isAdmin: (req, res, next) => {
    if (req.user && req.user.role === '2') {
      next();
    } else {
      res.status(403).json({ status: true, message: 'Permission denied!' });
    }
  },
};
