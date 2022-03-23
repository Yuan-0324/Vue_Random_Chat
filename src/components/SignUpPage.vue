<template>
  <div class="sign-up-container">
      <div @click="prevPage" class='prev-icon'>
          <font-awesome-icon icon="reply" />
      </div>
    <h3>SIGN UP</h3>
    <form @submit.prevent="sendSignUP">
      <input
        class="sign-up-input"
        type="text"
        placeholder="Name"
        v-model="userName"
        required
      />
      <input
        class="sign-up-input"
        type="text"
        placeholder="Email"
        v-model="email"
        required
      />
      <input
        class="sign-up-input"
        type="password"
        placeholder="Password"
        autocomplete="new-password"
        v-model="password"
        required
      />
      <input
        class="sign-up-input"
        type="password"
        placeholder="Password Confirm"
        autocomplete="new-password"
        v-model="confirmP"
        required
      />
      <input class="send-sign-up" type="submit" value="SUBMIT" />
    </form>
  </div>
</template>

<script>
// ref( ) : 可以接受任何型態的資料，但是不會對物件或陣列內部的屬性變動做監聽。
// reactive( ) : 只能接受物件或陣列，可以做深層的監聽，以及取得資料不需要 .value。
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";


export default {
  name: "SignUpPage",
  setup: () => {
    const email = ref(""),
      password = ref(""),
      confirmP = ref(""),
      userName = ref("");

    const router = useRouter();

    // --- 前一頁 ---
    const prevPage = () => {
        router.push("/");
    }

    // --- 註冊送出 ---
    const sendSignUP = () => {
      if (password.value === confirmP.value) {
        const auth = getAuth();
        console.log("start create");
        createUserWithEmailAndPassword(auth, email.value, password.value)
          .then((data) => {
            updateProfile(data.user, {
              displayName: userName.value
            });
            // TODO:如果需要 email 認證 可放這裡 sendEmailVerification

            alert('註冊成功！')
            router.push("/");
          })
          .catch((err) => {
            console.log("[註冊失敗]：", err.code);
            // 判斷失敗問題
            switch (err.code) {
                case "auth/invalid-email":
                    alert('Email 格式錯誤！請重新填寫！');
                    break;
                case "auth/email-already-exists":
                    alert('帳號已申請過囉！');
                    break;
                case "auth/weak-password":
                    alert('Password 太弱囉！請輸入6字以上！');
                    break;
                default: 
                    alert('申請失敗！請再確認輸入資訊！');
            }   
          });
      }
    };

    return {
      email,
      password,
      confirmP,
      userName,
      sendSignUP,
      prevPage
    };
  },
};
</script>
