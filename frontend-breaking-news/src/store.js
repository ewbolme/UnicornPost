import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

import createRootReducer from "./reducers/Index.reducer";

const initialState = {};

const reducer = createRootReducer();
const middleware = [thunk];
const enhancer = composeWithDevTools(applyMiddleware(...middleware));

export const store = createStore(reducer, initialState, enhancer);