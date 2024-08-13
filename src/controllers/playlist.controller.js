import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(name?.trim()===""){
        throw new ApiError(400,"name is not allowed to be empty")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"something went wrong at the time of playlist object creation")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            playlist,
            "playlist is created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400,"unauthorised required by client")
    }

    const channel = await Playlist.aggregate([
        {
            $match:{
                owner: user._id
            }
        }
    ])

    if(channel.length()!==0){
        throw new ApiError(500,"something went wrong at the end of mongodb")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            channel,
            "all playlist that are owne by user is retrive successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"unauthorised required by unavailable user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            playlist,
            "playlist is retrive successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500,"something went wrong at the time of vidoe pushing to playlist")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "video is added successfully on playlist"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500,"something went wrong at the time of vidoe removing to playlist")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "video is remove successfully from playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    await Playlist.deleteOne({
        _id: playlistId
    })

    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            "playlist is successfully deleted"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"unauthorised required make by user")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist._id,
        {
            $set:{
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500,"something went wrong updating playlist")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "playlist is successfully updated"
        )
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}