import { store } from "../store";
import { LOGIN_REJECT } from "../actionTypes/Auth.type";
import axios from "axios";

export const handleLocalAuthStore = async (data, tag="token") => {
    localStorage.setItem(tag,JSON.stringify({data}));
    if(tag === "token"){
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.IdToken}`;
    }
}

export const handleLocalAuthFetch = async (tag = "token") => {
    return localStorage.getItem(tag);
}

export const handleLocalAuthClear = async () => {
    await store.dispatch({ type: LOGIN_REJECT });
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_data");
    delete axios.defaults.headers.common['Authorization'];
}