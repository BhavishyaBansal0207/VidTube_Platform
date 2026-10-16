import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

/*
    owner ObjectId users
    videoFile string,
    thumbnail string,
    title string,
    description string,
    views number,
    duration number
    isPublished 
*/
const videoSchema = new Schema(
    {
        owner : {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        videoFile: {
            type: String,   // cloudianry url
            required: true
        },
        thumbnail: {
            type: String,   // cloudinary url
            required: true   
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)