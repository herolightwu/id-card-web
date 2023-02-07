import {
    
    STORE_USER_DATA,
    SET_SEL_CARD
} from "./constants"


export const storeUserData = userData => ({
    type: STORE_USER_DATA, userData
});

export const setSelCard = data => ({
    type: SET_SEL_CARD, data
})