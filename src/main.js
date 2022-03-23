import { createApp } from 'vue';
import App from './App.vue';
import router from './routes';
import './assets/stylesheet/main.css';
import { initializeApp } from 'firebase/app';
import 'firebase/database';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'

const config = {
    apiKey: "AIzaSyBl6EeLzbCsvDu32Sz8GiMyAIsE6TM8H4c",
    authDomain: "vue-chat-room-yuan.firebaseapp.com",
    projectId: "vue-chat-room-yuan",
    storageBucket: "vue-chat-room-yuan.appspot.com",
    messagingSenderId: "863620416841",
    appId: "1:863620416841:web:12c8b06f60db875759c698"
};

// ---- icons ----

library.add(fas);

initializeApp(config);

const vm = createApp(App);

vm.component('font-awesome-icon', FontAwesomeIcon);

vm.use(router);

vm.mount('#app');
