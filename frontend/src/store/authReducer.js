import * as actionTypes from './actionTypes';


export const initialState = {
    userId: null,
    token: null,
    error: null,
    isAuth: false
};

const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.AUTH_SUCCESS:
            return {
                ...state,
                userId: action.userId,
                token: action.token,
                isAuth: true,
                error: null
            }

        case actionTypes.AUTH_FAIL:
            return {
                ...state,
                userId: null,
                token: null,
                error: action.error,
                isAuth: false
            }

        case actionTypes.LOGOUT:
            return {
                ...state,
                userId: null,
                error: null,
                token: null,
                isAuth: false
            }

        case actionTypes.SET_ERROR:
            return {
                ...state,
                error: action.error
            }

        case actionTypes.REMOVE_ERROR: {
            return {
                ...state,
                error: null
            }
        }

        case actionTypes.SET_AUTH_DATA: {
            return {
                ...state,
                userId: action.user,
                token: action.token,
                isAuth: true
            }
        }

        default:
            return state;
    }
};

export default reducer;