import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)
    const id = video._id;

    const channel = await Comment.aggregate([
        {
            $match:{
                video: id
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        }
    ])

    console.log

    return res.status(201).json(
        new ApiResponse(
            200,
            channel,
            "all comments of video is getted successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Used authorized url")
    }

    const { content } = req.body
    if(!content){
        throw new ApiError(400,"commment is not allow to be empty")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })
    if(!comment){
        throw new ApiError(500,"Something went wrong during the comment creation")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            comment,
            "comment is successfully gerenated"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.query
    if(!content){
        throw new ApiError(400,"content of the comment can't be updated by nothing")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
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
            comment,
            "comment is updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    await Comment.deleteOne({
        _id: commentId
    })

    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            "comment is deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}