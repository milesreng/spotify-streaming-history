import { Express } from 'express'
import mongoose from 'mongoose'

export interface MongoUser extends Express.User {
  _id: string,
  username: string,
  email: string,
  password: string | null,
  googleId: string | null,
  firstName: string,
  lastName: string,
  streamingHistory: mongoose.Schema.Types.ObjectId[]
}

export interface IUser extends mongoose.Document {
  _id: string,
  username: string,
  email: string,
  password: string | null,
  googleId: string | null,
  firstName: string,
  lastName: string,
  streamingHistory: mongoose.Schema.Types.ObjectId[]
}

export const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  googleId: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  streamingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true })

export const User = mongoose.model<IUser>('User', userSchema)