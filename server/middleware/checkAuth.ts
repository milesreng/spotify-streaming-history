import { Request, Response, NextFunction } from 'express'

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('CHECK AUTH ' + req.isAuthenticated());
  if (!req.isAuthenticated()) { 
    res.status(401).send('unauthorized user')
    return
  }
  next()
}