import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if(subscription){
        await Subscription.deleteOne({
            _id: subscription._id
        })

        return res.status(201).json(
            new ApiResponse(
                200,
                {},
                "subscripation of channel is now toggled successfully"
            )
        )
    }

    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    return res.status(201).json(
        new ApiResponse(
            200,
            newSubscription,
            "subscripation of channel is now toggled successfully"
        )
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const user = await User.findById(subscriberId)
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: user._id
            }
        }
    ])

    return res.status(201).json(
        new ApiResponse(
            200,
            subscribers,
            "all subscribers of a channel retrives successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const user = await User.findById(channelId)
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                subscriber: user._id
            }
        }
    ])

    return res.status(201).json(
        new ApiResponse(
            200,
            subscribers,
            "all subscribers of a channel retrives successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}