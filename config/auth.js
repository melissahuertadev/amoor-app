module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            req.session.returnTo = req.originalUrl;
            req.flash("info_msg", "Oops! You need to log in to access to this resource.");
            return res.redirect("/home");
        }
        next();
    }
}