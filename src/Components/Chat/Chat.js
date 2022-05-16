import React, { useState, useEffect, useRef } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import "./Chat.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Filter from "bad-words";
import PhotoIcon from "@mui/icons-material/Photo";
import ClearIcon from "@mui/icons-material/Clear";
import InputEmoji from "react-input-emoji";
import { v4 as uuid } from "uuid";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_AUTH_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
});

/////

export const db = firebase.firestore();
const auth = firebase.auth();
var storage = firebase.app().storage().ref();

export default function Chat() {
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chatId, setChatId] = useState("123");
  const [status, setStatus] = useState("Active");
  const [fileUrl, setFileUrl] = useState(null);
  const [name, setName] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [chats, setChat] = useState([]);
  const [email, setEmail] = useState(null);
  const [uid, setUid] = useState("");
  const [users, setUsers] = useState([]);

  const signInWithToken = () => {
    var credential = firebase.auth.GoogleAuthProvider.credential(
      localStorage.getItem("token")
    );
    firebase
      .auth()
      .signInWithCredential(credential)
      .then((result) => {
        var user = result.user;
        setName(user.displayName);
        setProfilePic(user.photoURL);
        setEmail(user.email);
        setUid(user.uid);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    localStorage.getItem("token") && signInWithToken();
    db.collection(chatId)
      .orderBy("createdAt")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => {
            let mesgDoc = doc.data();
            mesgDoc.id = doc.id;
            return doc.data();
          })
        );
      });

    db.collection("users").onSnapshot((snapshot) => {
      setUsers(
        snapshot.docs
          .filter((doc) => doc.data().uid !== uid)
          .map((i) => i.data().name)
      );
    });
  }, [chatId]);

  useEffect(() => {
    uid &&
      db
        .collection("users")
        .doc(uid)
        .onSnapshot((snapshot) => setChat(snapshot.data().connections));
  }, [uid]);

  const badWordCheck = (text) => {
    const badWords = new Filter();
    badWords.isProfane(text)
      ? sendMessage(badWords.clean(text))
      : sendMessage(text);
  };

  const sendMessage = async (messge) => {
    await db.collection(chatId).add({
      text: messge,
      uid: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      name: name,
      picUrl: profilePic,
      imageUrl: fileUrl,
    });
    setMsg("");
    setFileUrl(null);
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const updateMessage = (reaction, mesgId, name) => {
    db.collection(chatId)
      .doc(mesgId)
      .update({
        reactions: { reaction: {} },
      });
  };

  return (
    <div className="chat-main-container">
      <div className="group-chats">
        <div className="user-status">
          <img src={`${profilePic}`} className="user-status-img" />
          <div>
            <p style={{ fontSize: "1.1rem" }}>{name}</p>
            <p
              style={{
                display: "flex",
                fontSize: "0.7rem",
                alignItems: "center",
                color: "#6b6b6b",
              }}
            >
              <div className={`status-${status}`}></div> {status}
            </p>
          </div>

          <div className="dropdown-btn">
            <p>...</p>
            <ul className="dropdown-chat">
              <li
                onClick={() => setStatus("Active")}
                style={{ borderBottom: "1px solid #333" }}
                className="dropdown-item-chat"
              >
                Active
              </li>
              <li
                onClick={() => setStatus("Away")}
                style={{ borderBottom: "1px solid #333" }}
                className="dropdown-item-chat"
              >
                Away
              </li>
              <li
                onClick={() => setStatus("Offline")}
                className="dropdown-item-chat"
              >
                Offline
              </li>
            </ul>
          </div>
        </div>
        <h1 className="groups-title">
          <ExpandMoreIcon /> CHATS
        </h1>

        <ul>
          {Object.keys(chats).map((i) => (
            <li onClick={() => setChatId(chats[i].chatId)}>{i}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="group-members-container">
          {/* <p style={{ marginLeft: "10px" }}>{eventName.toUpperCase()}</p> */}
          <div className="group-members"></div>
        </div>
        <div className="chat-container">
          {messages &&
            messages.map((message, idx) => {
              const date =
                message.createdAt &&
                message.createdAt.toDate().getMonth() +
                  "/" +
                  message.createdAt.toDate().getDate() +
                  "/" +
                  message.createdAt.toDate().getFullYear();
              const prevDate =
                message.createdAt &&
                messages[idx !== 0 ? idx - 1 : 0].createdAt
                  .toDate()
                  .getMonth() +
                  "/" +
                  messages[idx !== 0 ? idx - 1 : 0].createdAt
                    .toDate()
                    .getDate() +
                  "/" +
                  messages[idx !== 0 ? idx - 1 : 0].createdAt
                    .toDate()
                    .getFullYear();

              return (
                <div className="inner-chat-con" key={idx}>
                  <p
                    style={{
                      margin: "3px",
                      fontWeight: "300",
                      textAlign: "center",
                    }}
                  >
                    {idx === 0 || date !== prevDate ? date : ""}
                  </p>

                  <div
                    key={idx}
                    className={
                      message.uid === auth.currentUser.uid ? "sent" : "received"
                    }
                    style={{
                      margin: "3px",
                    }}
                  >
                    {message.uid !== auth.currentUser.uid ? (
                      <p
                        style={{
                          margin: "2px",
                          fontWeight: "300",
                          fontSize: "0.8rem",
                        }}
                      >
                        {message.name}
                      </p>
                    ) : (
                      ""
                    )}
                    <div className="message-box">
                      <img
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                        }}
                        src={message.picUrl}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          maxWidth: "30vw",
                        }}
                      >
                        <p>{message.text}</p>
                        {message.imageUrl !== null ? (
                          <a href={message.imageUrl} target="_blank">
                            <img
                              src={message.imageUrl}
                              style={{
                                width: "200px",
                                borderRadius: "10px",
                                marginTop: "5px",
                              }}
                            />
                          </a>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <span ref={dummy}></span>
        </div>
        <div className="send-container">
          {fileUrl && (
            <div
              style={{ display: "flex", alignItems: "center", width: "45vw" }}
            >
              <p
                style={{ fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setFileUrl(null)}
              >
                <ClearIcon
                  style={{
                    width: "25px",
                    height: "25px",
                  }}
                />
              </p>
              <img
                src={fileUrl}
                style={{
                  width: "50px",
                }}
              />
            </div>
          )}

          <div className="send-cont-inside">
            <InputEmoji
              onChange={(text) => {
                setMsg(text);
              }}
              onEnter={(ev) => {
                msg && badWordCheck(msg);
              }}
              cleanOnEnter
              value={msg}
              placeholder="Your message"
              className="msg-input"
            />

            <label className="picture-sub-btn" for="file">
              <PhotoIcon style={{ height: "25px", width: "25px" }} />
            </label>
            <input
              type="file"
              id="file"
              className="file-input"
              accept="image/png, image/gif, image/jpeg, image/svg"
              onChange={async (e) => {
                const file = e.target.files[0];
                const storageRef = storage;
                const fileRef = storageRef.child(file.name);
                await fileRef.put(file);
                setFileUrl(await fileRef.getDownloadURL());
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <h1>Add Users</h1>
        <ul>
          {users.map((user) => (
            <li
              onClick={() => {
                let obj = {};
                obj[user] = { name: user, chatId: uuid() };
                db.collection("users")
                  .doc(uid)
                  .set({ connections: obj }, { merge: true });
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

{
  /* <a
              disabled={msg.length === 0 ? true : false}
              onClick={() => {
                msg.length !== 0 ? badWordCheck(msg) : "";
              }}
              className="send-btn"
            >
              {<SendIcon style={{ height: "25px", width: "25px" }} />}
            </a> */
}

{
  /* <ul>
                          <li
                            onClick={() =>
                              updateMessage(
                                "surprise",
                                message.id,
                                message.name
                              )
                            }
                          >
                            &#128558;
                          </li>
                          <li
                            onClick={() =>
                              updateMessage("&#128545;", message.id)
                            }
                          >
                            &#128545;
                          </li>
                          <li
                            onClick={() =>
                              updateMessage("&#128532;", message.id)
                            }
                          >
                            &#128532;
                          </li>
                          <li
                            onClick={() =>
                              updateMessage("&#128525;", message.id)
                            }
                          >
                            &#128525;
                          </li>
                        </ul> */
}

{
  /* {event &&
              event.users.map((user) => (
                <img
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "10px",
                    margin: "5px",
                  }}
                  src={user.imageUrl}
                />
              ))} */
}

//   reactions: {
//     surprise: {
//       count: 0,
//       users: [],
//     },
//     angry: {
//       count: 0,
//       users: [],
//     },
//     sad: {
//       count: 0,
//       users: [],
//     },
//     love: {
//       count: 0,
//       users: [],
//     },
//   },

{
  /* {userGroups.map((ev, idx) => (
          <div key={idx}>
            <p
              className="group-name"
              onClick={() => {
                setChatId(ev.id);
                setEvent(ev);
                setEventName(ev.event.name);
              }}
            >
              {ev.event.name.toUpperCase()}
            </p>
          </div>
        ))} */
}
