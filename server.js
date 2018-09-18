const config = require('./config/config')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'movieratingapplicationsecretkey'

const app = express()
const router = express.Router()
const serverStatic =  require('serve-static')
const history = require('connect-history-api-fallback')

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.use(session({
	secret: config.SECRET,
	resave: true,
	saveUninitialzed: true,
	cookie: { httpOnly: false }
}))

app.use(passport.initialize())
app.use(passport.session())

// connect to mongodb
mongoose.connect(config.DB, function(){
	console.log('connection has been made')
})
.catch(err => {
	console.error('App starting error ', err.stack)
	process.exit(1)
})

//Include controllers
// const useC = require('./controllers/users')
// useC.controller(app)
// const movC = require('./controllers/movies')
// movC.controller(app)

fs.readdirSync('controllers').forEach(function (file) {
	if(file.substr(-3) == '.js'){
		const route = require('./controllers/' + file)
		console.log(file)
		route.controller(app)
	}
})

app.use(history())
app.use(serverStatic(__dirname + '/dist'))

router.get('/api/current_user', isLoggedIn, function(req, res){
	if(req.user){
		console.log(JSON.stringify(req.user))
		res.send({ current_user: req.user})
	} else {
		res.status(403).send({ success: false, message: 'Unauthorized'})
	}
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
		return next()
	
	res.redirect('/')
	console.log('error! auth failed')
}

router.get('/api/logout', function(req, res){
	req.logout()
	res.send()
})

router.get('/', function(req, res) {
	res.json({message: 'API Initialized'})
})

const port = process.env.API_PORT || 8081
app.use('/', router)

var server =app.listen(port, function () {
	console.log(`api running on port ${port}`)
})

module.exports = server
