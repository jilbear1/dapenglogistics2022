const withAuth = (req, res, next) => {
    if (!req.session.user_id) {
      res.redirect('/login');
    } else {
      next();
    }
  };

const adminAuth = (req, res, next) => {
    if (!req.session.admin) {
      withAuth(req, res, next)
    } else {
      next();
    }
};


  module.exports = {withAuth, adminAuth};


  //notes: user logged in, session.admin = false; user not logged in, session.admin = undefined;
