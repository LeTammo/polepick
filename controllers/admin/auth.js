function requireAdmin(req, res, next) {
    const adminKey = req.cookies['polepick-admin-key'];

    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.redirect('/admin/login');
    }

    next();
}

function getLoginPage(req, res) {
    res.render('admin/login', {
        pageTitle: 'Admin Login',
        error: req.query.error ? 'Invalid admin key' : null
    });
}

function handleLogin(req, res) {
    const { adminKey } = req.body;

    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.redirect('/admin/login?error=1');
    }

    res.cookie('polepick-admin-key', adminKey, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
    });

    res.redirect('/admin');
}

function handleLogout(req, res) {
    res.clearCookie('polepick-admin-key');
    res.redirect('/admin/login');
}

module.exports = {
    requireAdmin,
    getLoginPage,
    handleLogin,
    handleLogout,
};
