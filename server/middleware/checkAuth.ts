import { Request, Response, NextFunction } from 'express'
import { logger } from '..';

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.log('info', 'CHECK AUTH ' + req.isAuthenticated());
  if (!req.isAuthenticated()) { 
    res.status(401).send('unauthorized user')
    return
  }
  next()
}