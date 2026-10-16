import express from "express"
import cors from "cors"

const app = express()
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true 
    })
)

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended: true, limit: "16kb" }))

// We use express.static to serve static files like HTML, CSS, JavaScript, and images directly to the browser without writing individual route handlers for every single file.

app.use(express.static("public"))

// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)

// app.use(errorHandler)
export {app}

