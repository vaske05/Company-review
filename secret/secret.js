module.exports = {
    auth: {
        user: 'vaske494@gmail.com',
        pass: '29111994'
    },

    facebook: {
        clientID: '507269416288788',
        clientSecret: 'c9ef17a0f6ff7a9ae6c3063be55ecbc8',
        profileFields: ['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}