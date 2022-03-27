
<template>
  <div class="login-container">
    <div>
      <img src="../assets/logo.png" alt="" />
      <h1>CHAT FOR LIFE</h1>
    </div>
    <img
      class="sign-in-loading"
      :style="isLoading? 'display: block' : 'display:none'"
      src='/spin.svg'
    />
    <form action="">
      <label for=""></label>
      <input
        class="input-style"
        type="text"
        placeholder="Email"
        v-model="email"
      />
      <input
        class="input-style"
        type="password"
        placeholder="Password"
        v-model="password"
      />
      <div class="btns">
        <input
          class="send-btn"
          type="submit"
          value="LOGIN"
          @click.prevent="toChatPage"
        />
        <input
          class="sign-up"
          type="button"
          value="SIGN UP"
          @click="toSignUp"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { API_HOST } from "../assets/global/const";
import Axios from "axios";

const router = useRouter();
const email = ref(""),
  password = ref("");

const isLoading = ref(false);

const toSignUp = () => {
  // ---- 到註冊頁面 ----
  router.push("/sign_up");
};

const toChatPage = async () => {
  isLoading.value = true;

  const auth = getAuth();
  // ---- 登入 ----
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (user) => {
      const idToken = await user.user.getIdToken();
      // ---- 取得 Session Cookie ----
      const result = await Axios.post(API_HOST + "/chat/login", { idToken });
      // ------- 存入 Cookie -------
      document.cookie = `loginData=${result.data}; max-age=${
        24 * 60 * 60 * 7 * 1000
      }; path=/`;
      if (user) {
        isLoading.value = false;
      }
      router.push("/chat_page");
    })
    .catch((err) => {
      // console.log(err.code);
      switch (err.code) {
        case "auth/wrong-password":
          alert("密碼錯誤！");
          break;
        case "auth/user-not-found":
          alert("帳號未註冊！");
          break;
        default:
          alert("登錄錯誤！");
      }
    });
};
</script>