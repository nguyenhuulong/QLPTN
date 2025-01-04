import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import { UserOutlined, AppstoreOutlined } from "@ant-design/icons";

import TeacherList from "./components/TeacherList";
import LabManagement from "./components/LabManagement";

const { Content, Footer, Sider } = Layout;

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider>
          <div className="logo">HVKTQS</div>
          <Menu theme="dark" mode="inline">
            <Menu.Item key="1" icon={<UserOutlined />}>
              <a href="/teachers">Quản lý giáo viên</a>
            </Menu.Item>
            <Menu.Item key="2" icon={<AppstoreOutlined />}>
              <a href="/labs">Quản lý phòng thí nghiệm</a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ margin: "1rem", padding: "1rem" }}>
            <Routes>
              <Route path="/" element={<Navigate to="/teachers" replace />} />
              <Route path="/teachers" element={<TeacherList />} />
              <Route path="/labs" element={<LabManagement />} />
              <Route path="*" element={<Navigate to="/teachers" replace />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: "center" }}>Hệ thống quản lý khai thác phòng thí nghiệm © 2025</Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
