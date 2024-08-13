import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const like = await Like.findOne({
        video: videoId
    })
    if(like){
        await Like.deleteOne({
            video: videoId
        })

        return res.status(201).json(
            new ApiResponse(
                200,
                {},
                "video is unliked successfully"
            )
        )
    }

    const newlike = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })
    if(!newlike){
        throw new ApiError(500,"something went wrong at the time of liking the video")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            newlike,
            "video is liked successfully"
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const like = await Like.findOne({
        comment: commentId
    })
    if(like){
        await Like.deleteOne({
            comment: commentId
        })

        return res.status(201).json(
            new ApiResponse(
                200,
                {},
                "comment is unliked successfully"
            )
        )
    }

    const newlike = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })
    if(!newlike){
        throw new ApiError(500,"something went wrong at the time of liking the comment")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            newlike,
            "comment is liked successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const like = await Like.findOne({
        tweet: tweetId
    })
    if(like){
        await Like.deleteOne({
            tweet: tweetId
        })

        return res.status(201).json(
            new ApiResponse(
                200,
                {},
                "tweet is unliked successfully"
            )
        )
    }

    const newlike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if(!newlike){
        throw new ApiError(500,"something went wrong at the time of liking the tweet")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            newlike,
            "tweet is liked successfully"
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const channel = await Like.aggregate([
        {
            $match:{
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos", // The collection name in MongoDB where your videos are stored
                localField: "video", // The field in the Like collection that references the video
                foreignField: "_id", // The field in the Video collection that matches the localField
                as: "videoDetails" // The name of the new array field where the joined documents will be stored
            }
        },
        {
            $unwind: "$videoDetails" // Deconstructs the array from $lookup into individual documents
        }
    ])

    if(channel.length===0){
        throw new ApiError(500,"not found any video that are liked by user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            channel,
            "all liked videos are retrives successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}