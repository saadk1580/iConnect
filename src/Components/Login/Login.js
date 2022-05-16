import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { db } from "../Chat/Chat";

export default function Login() {
  var provider = new firebase.auth.GoogleAuthProvider();
  const [uid, setUid] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);

  firebase
    .auth()
    .getRedirectResult()
    .then((result) => {
      localStorage.setItem("token", result.credential.idToken);

      var user = result.user;
      setUid(user.uid);
      setName(user.displayName);
      setProfilePic(user.photoURL);
      setEmail(user.email);
    })
    .catch((error) => {
      console.log(error);
    });

  useEffect(() => {
    uid &&
      db
        .collection("users")
        .doc(uid)
        .onSnapshot((snapshot) =>
          snapshot.data() !== undefined
            ? ""
            : db
                .collection("users")
                .doc(uid)
                .set({
                  connections: [{}],
                  name: name,
                  email: email,
                  profilePic: profilePic,
                })
        );
  }, [uid]);

  return (
    <div className="login-page">
      <h1>iConnect</h1>
      <h3>Login</h3>
      <button onClick={() => firebase.auth().signInWithRedirect(provider)}>
        Google
      </button>
    </div>
  );
}
