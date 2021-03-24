import * as actionTypes from '../actions/types'
import {combineReducers} from "redux"


const initialUserState  = {
    currentUser:null,
    isLoading:true
}

const user_reducer = (state= initialUserState, action)=>{

    switch(action.type){
        case actionTypes.SET_USER:
            return {
                currentUser:action.payload.currentUser,
                isLoading:false
            }

        case actionTypes.CLEAR_USER:
            return {
                ...state,
                isLoading:false
            }
        default:
            return state
    }
}

const initialChannelState = {
    currentChannel:null,
    isPrivateChannel:false,
    userPosts:null
}
const channel_reducer = (state = initialChannelState, action)=>{
    switch(action.type){
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel:action.payload
            }

        case actionTypes.SET_PRIVATE_CHANNEL:
            return {
                ...state,
                isPrivateChannel:action.payload
            }

        case actionTypes.SET_USER_POSTS:
            return{
                ...state,
                userPosts:action.payload
            }
            
        default:
            return state
    }
}

const initialColorState = {
    primaryColor:'#4c3c4c',
    secondaryColor:'#eee'
}

const color_reducer = (state = initialColorState, action)=>{
    switch(action.type){
        case actionTypes.SET_COLORS:
            return {
                primaryColor:action.payload.primaryColor,
                secondaryColor:action.payload.secondaryColor
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    user:user_reducer,
    channel:channel_reducer,
    colors:color_reducer
})

export default rootReducer