import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    if(content.trim()===""){
        throw new ApiError(400, "content of the tweet is empty")
    }
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            200,
            tweet,
            "new tweet is successfully created"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const channel = await Tweet.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
    ])

    return res.status(201).json(
        new ApiResponse(
            200,
            channel,
            "all tweet created by user is geted successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if(content.trim()===""){
        throw new ApiError(400, "content of the tweet is empty")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: content
            }
        },
        {
            new: true
        }
    )

    return res.status(201).json(
        new ApiResponse(
            200,
            tweet,
            "tweet is updated"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!tweetId){
        throw new ApiError(400, "tweet Id is missing from url")
    }

    const response = await Tweet.deleteOne({
        _id: tweetId
    })

    console.log(response);

    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            "tweet is successfully deleted"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}