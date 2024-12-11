import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import winston from 'winston'
import bodyParser from 'body-parser'
import session from 'express-session'
import passport from 'passport'
import bcrypt from 'bcrypt'
import multer from 'multer'
import MongoStore from 'connect-mongo'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

import { User } from './models/user.model'
import { checkAuth } from './middleware/checkAuth'
import { streamController } from './controllers/stream.controller'

dotenv.config()

const app = express()

const HOST = process.env.HOST || '127.0.0.1'
const MONGO_URI = process.env.MONGO_URI || ''
const PORT = process.env.PORT || 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN || ''

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(
			(info) => `${info.timestamp} ${info.level}: ${info.message}`
		)
	),
	transports: [
		new winston.transports.Console(),
	]
})

const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb: any) => {
		cb(null, 'uploads/')
	},
	filename: (req: Request, file: Express.Multer.File, cb: any) => {
		cb(null, Date.now() + '-' + file.originalname)
	},
})

export const upload = multer({ storage })

app.use(cors({
	origin: `http://${HOST}:${CORS_ORIGIN}`, 
  credentials: true
}))

app.use(session({
	secret: 'abcde',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 1000 * 60 * 60 * 24 }, 		// 1 day
	store: MongoStore.create({
		mongoUrl: MONGO_URI,
		ttl: 1000 * 24 * 60 * 60				// 1 day
	})
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user: any, done: any) => {
	logger.log('info', 'serializing user')
	done(null, user._id)
})

passport.deserializeUser(async (id: any, done: any) => {
	logger.log('info', 'deserializing user')
	const user = await User.findById(id)
	return done(null, user)
})

// app.use(passport.authenticate('session'))

app.post('/auth/login', (req: Request, res: Response, next: any) => {
	passport.authenticate('local', (err: any, user: any, info: any) => {
		if (err) {
			return next(err)
		}
		if (!user) {
			return res.status(400).json({ message: info.message })
		}
		req.logIn(user, (err: any) => {
			if (err) {
				return next(err)
			}

			user.password = undefined
			return res.status(200).json(user)
		})
	})(req, res, next)
})

// app.post('/auth/callback', passport.authenticate('local', {
//   successReturnToOrRedirect: 'http://127.0.0.1:31000/',
//   failureRedirect: 'http://127.0.0.1:31000',
// }))

// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// app.get('/auth/google/callback', passport.authenticate('google', {
// 	failureRedirect: '/',
// 	successRedirect: 'http://localhost:5173/dashboard',
// 	failureMessage: true
//  }))

app.post('/auth/logout', (req: Request, res: Response) => {
	req.logout((err: any) => {
		if (err) {
			return res.status(500).json({ message: err })
		}

		req.session?.regenerate((err: any) => {
			if (err) {
				return res.status(500).json({ message: err })
			}
			res.status(200).json({ message: 'logged out'})
		})

	})

	// if (req.session) {
	// 	req.session.destroy((err: any) => {
	// 		if (err) return res.status(400).json({ message: err })
	// 		res.send({ message: 'logged out' })
	// 	})
	// }
})


// @route   POST api/user/streams
// @desc    Upload user streams
app.post('/user/streams', checkAuth, upload.single('file'), streamController.uploadStreams)

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

mongoose.set('strictQuery', false)

mongoose.connect(MONGO_URI).then(() => {
	logger.log('info', 'Connected to MongoDB')

	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, async (email: string, password: string, done: any) => {
    console.log('local strategy auth')
    const existUser = await User.findOne({ email })

    if (!existUser) {
      return done(null, false, { message: 'Incorrect email or password' })
    }

    if (!existUser.password) {
      return done(null, false, { message: 'Account belongs to an external signin method' })
    } 

		if (!bcrypt.compare(password, existUser.password)) {
      return done(null, false, { message: 'Incorrect email or password' })
    }
    
    return done(null, existUser)
  }))

  // passport.use(new GoogleStrategy({
  //   callbackURL: process.env.CALLBACK_URL || '',
  //   clientID: process.env.GOOGLE_CLIENT_ID || '',
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '' 
  // }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
  //   const id = profile.id
  //   const email = profile.emails[0].value
  //   const firstName = profile.name.givenName
  //   const lastName = profile.name.familyName
  //   const profilePicture = profile.photos[0].value
    
  //   console.log(profile)
  //   const existUser = await User.findOne({ email })

  //   if (!existUser) {
  //     const newUser = await User.create({
  //       googleId: id,
  //       email,
  //       username: email.split('@')[0],		// default username (email without domain)
  //       firstName: firstName || '',
  //       lastName: lastName || '',
  //       profilePicture: profilePicture || ''
  //     })

  //     return done(null, newUser)
  //   }

  //   return done(null, existUser)
  // }))

  app.listen(PORT, () => {
		logger.log('info', `Server running on port ${PORT}`)
	})
}).catch((err: any) => {
	logger.log('error', err)
})