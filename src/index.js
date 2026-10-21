import { app } from "./app.js";
import 'dotenv/config' 
import { connectDB } from "./db/index.js";
import dotenv from "dotenv"

const port = process.env.PORT || 8000;
dotenv.config({
    path : "./.env"
})

dotenv.config()

// app.listen(port, () => {
//     console.log(`Server is running on the port ${port}....`);
// })

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server running on the port ${port}`);
    })
})
.catch((err) => {
    console.log("Mongodb connection error", err);
})

// console.log("Hello from bhavishya bansal");