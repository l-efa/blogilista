import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;

export default { MONGODB_URI, PORT, SECRET };
