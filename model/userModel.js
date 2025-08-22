import mongoose from "mongoose";

const GenericSchema = new mongoose.Schema({}, { strict: false });
export const GenericModel = mongoose.model('User', GenericSchema, 'users');