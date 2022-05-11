import React from "react";
import firebase from "firebase/app";
import "firebase/auth";

export default function Login() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .getRedirectResult()
    .then((result) => {
      localStorage.setItem("token", result.credential.idToken);
    })
    .catch((error) => {
      console.log(error);
    });
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
