import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/register';
import Login from './pages/login';
import NoPage from './pages/404';
import Layout from './pages/navbar';
import AdminUsers from './pages/admin';
import Events from './pages/renginiai';
import PostEvent from './pages/ikeltirengini';




const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="events" element={<Events />} />
          <Route path="adminusers" element={<AdminUsers />} />
          <Route path="*" element={<NoPage />} />
          <Route path="postevent" element={<PostEvent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;