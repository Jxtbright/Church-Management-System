const adminstatus = (req, res, next) => {
    if(req.session.status === 'manager' || 'grouppastor' || 'pastor' || 'admin'){
        next();
    }
    else{
        req.flash('error', 'User is not authorized!')
        return res.redirect('/');
    }
};

const pastorstatus = (req, res, next) => {
    if(req.session.status === 'manager' || 'grouppastor' || 'pastor'){
        return next();
    }
    else{
        req.flash('error', 'User is not authorized!')
        return res.redirect('/');
    }
};

const grouppastorstatus = (req, res, next) => {
    if(req.session.status === 'manager' || 'grouppastor'){
        return next();
    }
    else{
        req.flash('error', 'User is not authorized!')
        return res.redirect('/');
    }
};

const managerstatus = (req, res, next) => {
    if(req.session.status === 'manager'){
        return next();
    }
    else{
        req.flash('error', 'User is not authorized!')
        return res.redirect('/');
    };
};

module.exports = { adminstatus, 
    pastorstatus, 
    grouppastorstatus, 
    managerstatus};