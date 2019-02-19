// Reducer #1: auth

const initialState = {
    isAuthenticated: false,
    user: {}
};

export default function(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}
