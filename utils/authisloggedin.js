const islogged = (req, res, next) => {
    if(req.session.isloggedin !== true){
        req.flash('error', 'User is not recognised!')
        return res.redirect('/');
    }
    if(req.session.status !== "manager" && req.session.status !== 'grouppastor' && req.session.status !== 'groupadmin' && req.session.status !== 'pastor' && req.session.status !== 'admin'){
        req.flash('error', 'User is not recognised!')
        return res.redirect('/');
    }
    return next();
};


module.exports = islogged;