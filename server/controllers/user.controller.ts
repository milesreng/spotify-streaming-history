import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import validator from 'validator'

import { MongoUser, User } from '../models/user.model'

export const userController = {
  getUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findById((req.user as MongoUser)._id)

      if (!user) {
        res.status(404).json({ message: 'User not found' })
      }

      if (user) {
        user.password = null
      }

      res.status(200).json(user)
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  register: async (req: Request, res: Response) => {
    try {
      console.log("registering user")

      const { username, email, firstName, password } = req.body
      const existUsername = await User.findOne({ username })

      if (existUsername) {
        res.status(400).json({ message: 'Username is already taken' })
        return
      }

      const existEmail = await User.findOne({ email })

      if (existEmail) {
        res.status(400).json({ message: 'Email is already taken' })
        return
      }

      // if (!validator.isStrongPassword(password)) {
      //   res.status(400).json({error: 'password is too weak'})
      //   return
      // }
      
      // confirm username format
      if (!validator.matches(username, '^[a-zA-Z0-9_.-]*$')) {
        res.status(400).json({error: 'username format not valid'})
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await User.create({
        username,
        email,
        firstName,
        password: hashedPassword
      })

      if (!newUser) {
        res.status(500).json({ message: 'Error creating user' })
        return
      }

      res.status(201).json({ message: 'User created successfully' })

    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
}