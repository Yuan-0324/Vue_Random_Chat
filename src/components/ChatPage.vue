<template>
  <div
    :style="chatTarget.email ? 'display:none' : 'display:flex'"
    class="user-name"
  >
    <h3>Hi, {{ userName }}</h3>
    <button @click="signOut">SIGN OUT</button>
  </div>

  <!-- if start 是 true 會顯示按鈕 -->
  <div class="start-btn" v-if="startToogle">
    <h1 @click.prevent="startChat">START</h1>
  </div>

  <!-- else false 會顯示 開始聊天 [ Loading 及 聊天室 ] -->
  <div v-else>
    <!-- if 沒有聊天對象會顯示 Loading -->
    <div class="loading_page" v-if="!chatTarget.email">
      <button @click="cancelLoadong">Cancel ( {{ count }} )</button>
      <img src="/wait.svg" alt="" />
      <h1>Waiting For Connection...</h1>
    </div>

    <!-- else 會顯示聊天室 -->
    <div
      class="chat-container"
      :style="!chatTarget.email ? 'display:none' : 'display:flex'"
      v-else
    >
      <div class="chat-head">
        <!-- DONE: 回到開始畫面安鈕「點擊事件」 -->

        <button @click="leaveRoom">LEAVE</button>
        <!-- DONE: 對話對象名稱 -->
        <h1>{{ chatTarget.name }}</h1>
      </div>

      <div
        id="container"
        class="chat-content"
      >
        <!-- DONE: 這裡渲染對話框 -->
        <!-- DONE: 看能否偵測上一個是否同人留言，是的話可以不用顯示名稱 -->

        <div
          class="chat"
          :id="msg.sender.email == userEmail ? 'right' : 'left'"
          v-for="(msg, index) in Object.values(groupMsg)[0]"
          :key="msg.id"
        >
          <h6
            :style="
              index > 0
                ? Object.values(groupMsg)[0][index - 1].sender.email == msg.sender.email
                  ? 'display:none'
                  : ''
                : ''
            "
          >
            {{ msg.sender.name }}
          </h6>
          <p>{{ msg.msg }}</p>
        </div>
      </div>

      <div class="chat-send">
        <form @submit.prevent="sendMsg" action="">
          <input
            class="message"
            type="text"
            placeholder="Message..."
            v-model="msgContent"
          />
          <input class="send-message" type="submit" value="SEND" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, watch, watchEffect } from "vue";
import { API_HOST } from "../assets/global/const";
import Axios from "axios";
import { loginChecker } from "../login_checker";
import { useRouter } from "vue-router";
import { getAuth } from "firebase/auth";
import VueCookie from "vue-cookie";
import { io } from "socket.io-client";
import { uuid } from "vue-uuid";

const startToogle = ref(true);
const router = useRouter();
let socket;

// --- Current User ---
const userName = ref(""),
  userEmail = ref(""),
  userVerfied = ref(false),
  chating = ref(false);

// --- All Users ---
const allUsers = ref([]);

// --- 對方 user ---
const chatTarget = ref({});

// --- 是否在等待 ---
const isLoading = ref(true);

// --- 輸入內容 ---
const msgContent = ref("");

// --- 倒數 ---
const count = ref(30);

// --- 聊天訊息陣列 ---
let groupMsg = ref({});

// --- 將兩個 email 做排列 當房間名字 ---
const sortNames = (username1, username2) => {
  return [username1, username2].sort().join("-");
};

// --- 訊息顯示最底部 ---
const scrollToBottom = () => {
  const container = document.getElementById("container");
  container.scrollTop = container.scrollHeight;
};

// ---- 畫面一開始取得使用者資料 ----
onMounted(async () => {
  let user = await loginChecker();
  if (user == "NOTLOGIN") {
    router.push("/");
  } else {
    userName.value = user.name;
    userEmail.value = user.email;
    userVerfied.value = user.email_verfied;
  }
  if (document.getElementById("container")) {
    // console.log("to Bottom");
    scrollToBottom();
  }
});

// ---- 最新內容顯示在最底部 ----
onUpdated(() => {
  if (document.getElementById("container")) {
    // console.log("to Bottom");
    scrollToBottom();
  }
  // console.log(groupMsg.value);
});

// ---- 開始配對聊天 ----
let countDown;
let watcher;
const startChat = () => {
  // --- 30 秒倒數 ---
  count.value = 30;
  watcher = watchEffect(() => {
    if (count.value > 0) {
      countDown = setTimeout(() => {
        count.value -= 1;
        console.log(count.value);
      }, 1000);
    }
    if (count.value === 0 && !chatTarget.value.email) {
      cancelLoadong();
    }
    if (chatTarget.value.email) {
      clearTimeout(countDown);
      watcher();
    }
  });

  startToogle.value = !startToogle.value;

  // ---- 連線 socket.io ----
  socket = io.connect(API_HOST, { forceNew: true });

  socket.emit("new_user", {
    name: userName.value,
    email: userEmail.value,
    chat: chating.value,
  });

  // ---- 所有使用者 ----
  socket.on("all_user", (users) => {
    const tempUsers = { ...users };

    // ---- 移除自己 ----
    delete tempUsers[userEmail.value];
    const tempArr = Object.values(tempUsers).filter(
      (temp) => temp.chat !== true
    );

    allUsers.value = tempArr;

    // -------- 可聊天對象 --------
    socket.on("chat_list", (chatList) => {
      const currentUser =
        chatList.find((chat) => chat.email == userEmail.value) || {};

      // --- 排除自己後的可聊天清單 ---
      const newChatList = chatList.filter(
        (user) => user.email !== userEmail.value
      );
      // 如果自己還未配對 且聊天清單有一人以上可以配對時 開始配對
      if (currentUser.email && !currentUser.chat && newChatList.length >= 1) {
        isLoading.value = false;

        // ---- 跟進來的第一個做連線 ----
        const targetUser = newChatList[0];

        console.log(newChatList);

        chatTarget.value = targetUser;

        socket.emit("compare", {
          currentUser: userEmail.value,
          targetUser: targetUser.email,
        });
      } else {
        // --- 當未配對到人時 ---
        if (!chatTarget.value.email) {
          console.log("Waiting For User Login");
          // --- 等待中 為 true ---
          isLoading.value = true;
        }
      }
    });
  });

  socket.on("new_message", (msg) => {
    // console.log("New Coming");

    const prevMsg = { ...groupMsg.value };

    // --- 創造聊天室 ---
    const key = sortNames(msg.sender.email, msg.receiver.email);

    // --- 如果聊天室存在，聊天記錄 push 進去，如果沒有創一個。
    if (key in prevMsg) {
      prevMsg[key] = [...prevMsg[key], msg];
    } else {
      prevMsg[key] = [msg];
    }
    groupMsg.value = { ...prevMsg };
  });

  // ---- 可聊天對象 ----
  // socket.on("chat_list", (chatList) => {
  //   const currentUser =
  //     chatList.find((chat) => chat.email == userEmail.value) || {};

  //   // --- 排除自己後的可聊天清單 ---
  //   const newChatList = chatList.filter(
  //     (user) => user.email !== userEmail.value
  //   );
  //   // 如果自己還未配對 且聊天清單有一人以上可以配對時 開始配對
  //   if (currentUser.email && !currentUser.chat && newChatList.length >= 1) {
  //     isLoading.value = false;

  //     // const targetUser =
  //     //   newChatList[Math.floor(Math.random() * newChatList.length)];

  //     // ---- little change ----
  //     const targetUser = newChatList[0];
  //     // -----------------------

  //     chatTarget.value = targetUser;
  //     socket.emit("compare", {
  //       currentUser: userEmail.value,
  //       targetUser: targetUser.email,
  //     });
  //   } else {
  //     // --- 當未配對到人時 ---
  //     if (!chatTarget.value.email) {
  //       console.log("Waiting For User Login");
  //       // --- 等待中 為 true ---
  //       isLoading.value = true;
  //     }
  //   }
  // });
};

// ---- 送出訊息 ----
const sendMsg = () => {
  // --- 講聊天內容用 socket 傳遞 ---
  if (chatTarget.value.email && msgContent.value !== "") {
    const data = {
      id: uuid.v4(),
      sender: { name: userName.value, email: userEmail.value },
      receiver: chatTarget.value,
      msg: msgContent.value,
    };
    socket.emit("send_message", data);

    // --- 創造聊天室 ---
    const key = sortNames(userEmail.value, chatTarget.value.email);
    const tempGroup = { ...groupMsg.value };

    // --- 如果聊天室存在，聊天記錄 push 進去，如果沒有創一個聊天室 ---。
    if (key in tempGroup) {
      tempGroup[key] = [...tempGroup[key], data];
    } else {
      tempGroup[key] = [data];
    }
    groupMsg.value = { ...tempGroup };

    msgContent.value = "";
  }
};

const cancelLoadong = () => {
  watcher();
  clearTimeout(countDown);
  // ---- 登出 socket.io ----
  socket.disconnect();
  // ---- 對象清空 ----
  chatTarget.value = {};
  // ---- 等待中 為 false ---
  isLoading.value = false;
  // ---- 轉回 start ----
  startToogle.value = true;
};

// ----- 離開聊天室 ----
const leaveRoom = () => {
  // ---- 清空聊天記錄 ----
  const msg = `[系統訊息]：很可惜！對方已離開聊天室囉！期待下次的緣分吧！`;
  const data = {
    id: uuid.v4(),
    sender: { name: userName.value, email: userEmail.value },
    receiver: chatTarget.value,
    msg: msg,
  };
  socket.emit("send_message", data);

  setTimeout(() => {
    // ---- 登出 socket.io ----
    socket.disconnect();
    const room = sortNames(userEmail.value, chatTarget.value.email);
    delete groupMsg.value[room];
    // ---- 對象清空 ----
    chatTarget.value = {};
    // ---- 等待中 為 false ---
    isLoading.value = false;
    // ---- 轉回 start ----
    startToogle.value = true;
  }, 100);
};

// ---- 登出 ----
const signOut = async () => {
  // ---- 登出 socket.io ----
  if (socket) {
    // ---- socket.io 斷開 ----
    socket.disconnect();
  }
  // ---- 移除 Session Cookie ----
  const cookieArray = document.cookie.split("; ");
  const cookieObj = {};
  cookieArray.forEach((cookie, idx) => {
    const tempArr = cookie.split("=");
    cookieObj[tempArr[0]] = tempArr[1];
  });
  const auth = getAuth();
  await auth.signOut();
  await Axios.post(`${API_HOST}/chat/sign_out`, {
    loginData: cookieObj.loginData,
  });
  VueCookie.delete("loginData");
  router.push("/");
};
</script>

