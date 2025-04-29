import mongoose from "mongoose"
import { app } from "../index.js"
import { configDotenv } from "dotenv";
configDotenv()

export const DBConnect = async () => {
    try {
        if (process.env.MONGODB_URL) {
            await mongoose.connect(process.env.MONGODB_URL).then(() => {
                app.listen(3000, () => {
                    console.log("DB Connected")
                    console.log("Appp Connected")
                })
            })
        }
        console.log("Mongo DB Url Do Not Exists")
    } catch (error) {
        console.log("Error in connecting DB ", error)
        return
    }
}