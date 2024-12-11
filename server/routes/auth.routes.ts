import express, { Request, Response } from 'express'

import { userController } from '../controllers/user.controller'
import { checkAuth } from '../middleware/checkAuth'

const router = express.Router()

// @route   POST auth/register
// @desc    Register user
router.post('/register', userController.register)

export default router