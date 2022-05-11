import { Route, BrowserRouter, Routes } from "react-router-dom";
import React from "react";
import Login from "./Login/Login";
import Chat from "./Chat/Chat";

export function Routess() {
  return (
    <Routes>
      <Route exact path="/login" element={<Login />} />
      <Route exact path="/" element={<Chat />} />
    </Routes>
  );
}
