import {
  
  STORE_USER_DATA,
  SET_SEL_CARD
} from './constants'

const initialState = {
  
  userData: null,
  selCard: {}
}

import { navigate } from 'gatsby'

export default (state = initialState, action) => {
  switch (action.type) {
    
    case STORE_USER_DATA:
    
      const newStateStoreUserData = { ...state, userData: action.userData }
      
      return newStateStoreUserData
    case SET_SEL_CARD:
      return {
        ...state,
        selCard: action.data
      }
    default:
      return state
  }
}
