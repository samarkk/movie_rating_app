const User = require('../models/User.js')
const passport = require('passport')  //dnh
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')

const ExtractJwt = passportJWT.ExtractJwt
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'thisisthesecretkey'

module.exports.controller = (app) => {
	const LocalStrategy = require('passport-local').Strategy
	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, 
	function(email, password, done){
		User.getUserByEmail(email, function(err, user){
			if(err) { return done(err) }
			if(!user) { return done(null, false) }
			User.comparePassword(password, user.password, function(err, isMatch){
				if(isMatch) { 
					return done(null, user)
				} else {
					return done(null, false)
				}
			})
		})
	}))
	
	app.post('/users/register', (req, res) => {
		const name = req.body.name
		const email = req.body.email
		const password = req.body.password
		const newUser = new User({
			email: email,
			name: name,
			password: password
		})
		User.createUser(newUser, function(error, user){
			if(error) { 
				res.status(422).json({
					message: 'Something went wrong. Please try after some time'
				})
			}
			res.send({ user: user})
		})
	})
	
	app.post('/users/login', 
		passport.authenticate('local', { failureRedirect: '/users/login' }),
		function(req, res) {
			res.redirect('/')
	})
		
	passport.serializeUser(function(user, done) {
		done(null, user.id)
	})
		
	passport.deserializeUser(function(id, done){
			User.findById(id, function(err, user){
				done(null, user.id)
		})
	})
	
}