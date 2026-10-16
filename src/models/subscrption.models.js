import { Schema } from "mongoose";
import mongoose from "mongoose";

const subscriptionScehma = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,               // A person subscribes to a channel
            ref: "User"
        },
        channel: {                                    // A person who owns the channel
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)