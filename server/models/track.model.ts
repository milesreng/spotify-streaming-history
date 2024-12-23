import express from 'express'
import mongoose from 'mongoose'

export interface ITrack extends mongoose.Document {
  name: string,
  artist: string,
  album: string,
  year: number | null,
  length: number | null,
  genre: string | null,
  image_url: string | null,
  spotify_uri: string | null,
}

export const trackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  year: { type: Number },
  length: { type: Number },
  genre: { type: String },
  image_url: { type: String },
  spotify_uri: { type: String, unique: true, required: true }
}, { timestamps: true })

export const Track = mongoose.model<ITrack>('Track', trackSchema)