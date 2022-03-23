import { initializeApp } from 'firebase/app';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyBl6EeLzbCsvDu32Sz8GiMyAIsE6TM8H4c",
    authDomain: "vue-chat-room-yuan.firebaseapp.com",
    projectId: "vue-chat-room-yuan",
    storageBucket: "vue-chat-room-yuan.appspot.com",
    messagingSenderId: "863620416841",
    appId: "1:863620416841:web:12c8b06f60db875759c698"
};

const db = initializeApp(config);

export default db;