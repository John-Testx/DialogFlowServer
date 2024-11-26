import { config } from "dotenv";
config()
export const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

export const HOST = isProduction
    ? process.env.HOST // Use production URL
    : 'http://localhost:' + PORT;

export const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
export const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
