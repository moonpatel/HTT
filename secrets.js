import { config } from "dotenv";

config({
    path:"./data/config.env",
})

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
