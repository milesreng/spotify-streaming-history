import express, { Request, Response } from 'express'

import { streamController } from '../controllers/stream.controller'
import { checkAuth } from '../middleware/checkAuth'

const router = express.Router()

// @route   GET api/streaming/track-stats/:track-id
// @desc    Get stats for a given track ID (spotify URI)
router.get('/track-stats', checkAuth, streamController.getTrackStats)

// @route   GET api/streaming/top-tracks
// @desc    Get top tracks
router.get('/top-tracks', checkAuth, streamController.getTopTracks)

export default router