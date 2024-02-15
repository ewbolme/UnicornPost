import { combineReducers } from "redux";

import AuthReducer from "./Authorization.reducer";
import homeReducer from "./home.reducer";

const createReducers = () =>
  combineReducers({
    auth: AuthReducer,
    home: homeReducer
  });

export default createReducers;
