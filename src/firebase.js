import firebase from 'firebase/app'
import "firebase/firestore"
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

var config = {
    apiKey: "AIzaSyC9b-QQnAsaKozraEHefn8Lj9xgTGFTHfU",
    authDomain: "react-slack-clone-d5222.firebaseapp.com",
    projectId: "react-slack-clone-d5222",
    storageBucket: "react-slack-clone-d5222.appspot.com",
    messagingSenderId: "383641537706",
    appId: "1:383641537706:web:e42035d798d6593b5154d3",
    measurementId: "G-VYXJVK3Z77"
};


firebase.initializeApp(config)
export const db = firebase.firestore()

export default firebase