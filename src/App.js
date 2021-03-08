import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import '@firebase/firestore';
import '@firebase/auth';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAPxNA3_t15LsHvTxVzoqKsKjNsw7JQZbM",
  authDomain: "superchat-71d25.firebaseapp.com",
  projectId: "superchat-71d25",
  storageBucket: "superchat-71d25.appspot.com",
  messagingSenderId: "343178450790",
  appId: "1:343178450790:web:011f2cbc714346cbdbdaa7",
  measurementId: "G-GKQWS493CT"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
      <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  
  const autoScroll = useRef();

  const messagesReference = firestore.collection('messages');
  const query = messagesReference.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const { uid, photoURL} = auth.currentUser;

    await messagesReference.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    autoScroll.current.scrollIntoView({behavior: 'smooth'});

  }
  return (
  <>
  <main>
    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
    <div ref={autoScroll}></div>
  </main>

  <form onSubmit={sendMessage}>
    <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
    <button type="submit">Send emooji</button>
  </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}
export default App;
