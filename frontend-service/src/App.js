import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { UserOutlined, AppstoreOutlined } from "@ant-design/icons";

import keycloak, { getClientRoles, keycloakAuthenticated, keycloakLogout, loadUserProfile } from "./keycloak";

import TeacherList from "./components/TeacherList";
import LabManagement from "./components/LabManagement";

const { Content, Footer, Sider } = Layout;

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState(null);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (keycloak.authenticated) {
      setAuthenticated(true);
      const roles = getClientRoles()
      setUserRole(roles[0])
      loadUserProfile().then(profile => {
        setUserProfile(profile);
      });
    }
  }, []);

  const handleLogout = () => {
    keycloakLogout();
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider style={{ height: "100vh" }} theme="dark">
          <div className="logo">HVKTQS</div>
          <Menu theme="dark" mode="inline">
            <Menu.Item key="1" icon={<AppstoreOutlined />}>
              <a href="/labs">Quản lý phòng thí nghiệm</a>
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              <a href="/teachers">Quản lý giáo viên</a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ maxHeight: "100vh", overflowY: "scroll" }}>
          <Content style={{ margin: "1rem", padding: "1rem" }}>
            {userProfile && (
              <div style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center"
              }}>
                <p>Xin chào, {userProfile.firstName} {userProfile.lastName}</p>
                <Button onClick={handleLogout} style={{ marginLeft: "8px" }}>Đăng xuất</Button>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Navigate to="/labs" replace />} />
              <Route path="/labs" element={<LabManagement />} />
              <Route path="/teachers" element={<TeacherList />} />
              <Route path="*" element={<Navigate to="/labs" replace />} />
            </Routes>
            <Footer style={{ textAlign: "center" }}>Hệ thống quản lý khai thác phòng thí nghiệm © 2025</Footer>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
