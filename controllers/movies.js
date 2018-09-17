const Movie = require('../models/Movie.js')
const Rating = require('../models/Rating.js')
const passport = require('passport')  //dnh
const passportJWT = require('passport-jwt')
const JwtStraregy = passportJWT.Stragegy
const jwt = require('jsonwebtoken')

const ExtractJwt = passportJWT.ExtractJwt
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
jwtOptions.secretOrKey = 'thisisthesecretkey'

module.exports.controller = (app) => {
	app.get('/movies',  (req, res) => {
		Movie.find({}, 'name description release_year genre', (error, movies) => {
			if(error) { console.log(error) }
			console.log('here in app.get /movies before res.send')
			console.log('passport is ' + passport + ' and passportJWT is ' + passportJWT)
			res.send({
				movies
			})
		})
	})
	app.get('/api/movies/:id', function(req, res){
		Movie.findById(req.params.id, 'name description release_year genre', (error, movie) => {
		  if(error) { console.log(error) }
		  res.send(movie)
		})
	})
	app.post('/movies', (req, res) => {
		const newMovie = new Movie({
			name: req.body.name,
			description: req.body.description,
			release_year: req.body.release_year,
			genre: req.body.genre
		})
		
		newMovie.save( (error, movie) => {
			if(error) { console.log(error) }
			res.send(movie)
		})
	})
	app.post('/movies/rate/:id', (req, res) => {
		const rating = new Rating({
			movie_id: req.params.id,
			user_id: req.body.user_id,
			rate: req.body.rate
		})
		
		rating.save(function(error, rating) {
			if(error) { console.log(error) }
			res.send({
			movie_id: rating.movie_id,
			user_id: rating.user_id,
			rate: rating.rate
			})
		})
	})
}