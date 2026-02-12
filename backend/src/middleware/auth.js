function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect(302, '/login');
  }
  return next();
}

module.exports = { requireAuth };
