import React, { useState, useEffect } from "react";
import { Table, Spin, message } from "antd";

import { getTeachers } from "../services/api";

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await getTeachers();
                setTeachers(data);
            } catch (error) {
                message.error("Lỗi khi tải danh sách giáo viên.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    const columns = [
        {
            title: "Tên giáo viên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Khoa/Bộ môn",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Môn học",
            dataIndex: "subjects",
            key: "subjects",
            render: (subjects) => subjects.join(", "),
        },
    ];

    if (loading) return <Spin size="large" style={{ display: "block", margin: "auto" }} />;

    return (
        <div className="page-container">
            <h2>Danh sách giáo viên</h2>
            <Table columns={columns} dataSource={teachers} rowKey="id" />
        </div>
    );
};

export default TeacherList;
