import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ObjectId} from "mongodb"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { deleteOnCloudinary, extractPublicId } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const user = await User.findById(userId)
    const id = user._id
    console.log(id)

    let parsedQuery = {};
    try {
        parsedQuery = JSON.parse(query);
    } catch (error) {
        return res.status(400).send("Invalid query parameter");
    }
    const channel = await Video.aggregate([
        {
            $match:{
                owner: id,
                ...parsedQuery
            }
        },
        {
            $sort:{
                [sortBy]: Number(sortType)
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit: limit
        }
    ])

    return res.status(201).json(
        new ApiResponse(
            200,
            channel,
            "get all video that published by user successfully"
        )
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(title.trim()===""){
        throw new ApiError(400,"title is required to be fill");
    }

    //--> check for thumbnail and videoFile
    //--> upload thumbnail aur video file in cloundinary
    const thumbnailPath = req.files?.thumbnail[0]?.path;
    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    const videoFile = await uploadOnCloudinary(videoFilePath)
    if(!(thumbnail && videoFile)){
        throw new ApiError(400,"thumbnail and video file must be required")
    }
    //--> check duration of video
    // const duration = await getVideoDuration(videoFile.url);

    //--> create video object
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description || "",
        duration: videoFile.duration,
        owner: req.user._id
    })

    //--> check for video creation
    const existedVideo = await Video.findById(video._id);
    if(!existedVideo){
        throw new ApiError(400,"video is already uploaded by user");
    }
    
    //--> return res
    return res.status(201).json(
       new ApiResponse(200, video, "video is uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!(video.owner.toString()===req.user._id.toString())){
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $inc:{
                    views: 1
                }
            },
            {
                new: true
            }
        )
        return res.status(201).json(
            new ApiResponse(
                200,
                updatedVideo,
                "video is successfully get by id"
            )
        )
    }
    return res.status(201).json(
        new ApiResponse(
            200,
            video,
            "video is successfully get by id"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body;
    
    const thumbnailPath = req.file?.path;
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    return res.status(201).json(
        new ApiResponse(
            200,
            video,
            "information of video is updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)

    const thumbnailPath = video.thumbnail;
    const videoFilePath = video.videoFile;

    await Video.deleteOne({
        _id: videoId
    })
    // if(resultVideoFile.result==="ok" && resultThumbnail.result==="ok"){
        
    // }
    // else{
    //     console.log("thumbnail and video file are deleting")
    // }
    await deleteOnCloudinary(extractPublicId(thumbnailPath))
    await deleteOnCloudinary(extractPublicId(videoFilePath), 'video')

    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            "video is successfully deleted"
        )
    )
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    const toggle = video.isPublished;
    const updatedVideo=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished: !toggle?true:false
            }
        }
    )

    return res.status(201).json(
        new ApiResponse(
            200,
            updatedVideo,
            "publish video flied is toggled successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}