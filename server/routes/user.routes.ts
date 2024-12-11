import express, { Request, Response } from 'express'

import { userController } from '../controllers/user.controller'
import { streamController } from '../controllers/stream.controller'
import { checkAuth } from '../middleware/checkAuth'
import { upload } from '..'

const router = express.Router()

// @route   GET api/user/
// @desc    Get user info
router.get('/', checkAuth, userController.getUser)

router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'User route is working' })
})

// @route   GET api/user/streams
// @desc    Get user streams
router.get('/streams', checkAuth, streamController.getStreamsByFilter)


export default router