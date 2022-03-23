import Axios from 'axios';
import { API_HOST } from './assets/global/const';
import VueCookie from 'vue-cookie';

// ---- 是否登入，登入後可以直接轉跳 ----
export const loginChecker = async () => {
    // ---- GET COOKIES ----
    const loginData = VueCookie.get('loginData');
    // ---- Check Login ----
    let user = await Axios.post(`${API_HOST}/login/checker`, { loginData: loginData });
    return user.data;
}