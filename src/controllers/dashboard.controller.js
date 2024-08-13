import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const totalViewResult = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $group:{
                _id: null,
                Views: {
                    $sum: "$views"
                }
            }
        }
    ])
    const totalView = totalViewResult.length>0?totalViewResult[0].Views:0

    const totalSubscribersResult = await Subscription.aggregate([
        {
            $match:{
                channel: req.user._id
            }
        },
        {
            $count: "SubScribers"
        }
    ])
    const totalSubscribers = totalSubscribersResult.length>0?totalSubscribersResult[0].SubScribers:0

    const totalVideosResult = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $count: "Videos"
        }
    ])
    const totalVideos = totalVideosResult.length>0?totalVideosResult[0].Videos:0

    const totalLikesResult = await Like.aggregate([
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $match:{
                "video.owner": req.user._id
            }
        },
        {
            $group:{
                _id:null,
                totalLikes:{
                    $sum: 1
                }
            }
        }
    ])
    const totalLikes = totalLikesResult.length>0?totalLikesResult[0].totalLikes:0

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalView,
                totalSubscribers,
                totalVideos,
                totalLikes
            },
            "all stats of a channel retrives successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const allVideos = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        }
    ])

    if(allVideos.length===0){
        throw new ApiError(400,"channel not have any video uploaded on channel")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            allVideos,
            "all videos are retrives that are uploaded on channel successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
}