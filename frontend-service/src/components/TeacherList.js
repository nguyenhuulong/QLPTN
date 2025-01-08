import React, { useState, useEffect } from "react";
import { Table, Spin, message } from "antd";

import { getDepartments, getSubjects, getTeachers } from "../services/api";

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);

    const [subjects, setSubjects] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teacherData = await getTeachers();
                const subjectData = await getSubjects();
                const departmentData = await getDepartments();
                const sortedDepartments = departmentData.sort((a, b) => a.name.localeCompare(b.name));

                // Sắp xếp giáo viên theo department name
                const sortedTeachers = teacherData.sort((a, b) => {
                    const departmentA = a.departmentId?.name || '';
                    const departmentB = b.departmentId?.name || '';
                    return departmentA.localeCompare(departmentB);
                });

                // Sắp xếp môn học theo department name
                const sortedSubjects = subjectData.sort((a, b) => {
                    const departmentA = a.departmentId?.name || '';
                    const departmentB = b.departmentId?.name || '';
                    return departmentA.localeCompare(departmentB);
                });

                setDepartments(sortedDepartments);
                setTeachers(sortedTeachers);
                setSubjects(sortedSubjects);
            } catch (error) {
                message.error("Lỗi khi tải danh sách giáo viên.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const columnsDepartment = [
        {
            title: "Tên khoa - bộ môn",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Số giáo viên",
            dataIndex: "teachers",
            key: "teachers",
            render: (teachers) => teachers && teachers.length,
        },
        {
            title: "Số môn học phụ trách",
            dataIndex: "subjects",
            key: "subjects",
            render: (subjects) => subjects && subjects.length,
        }
    ];

    const columnsTeacher = [
        {
            title: "Tên giáo viên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Tài khoản",
            dataIndex: "account",
            key: "account",
        },
        {
            title: "Khoa/Bộ môn",
            dataIndex: "departmentId",
            key: "departmentId",
            render: (departmentId) => departmentId && departmentId.name,
        }
    ];

    const columnsSubject = [
        {
            title: "Tên môn học",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Khoa/Bộ môn",
            dataIndex: "departmentId",
            key: "departmentId",
            render: (departmentId) => departmentId && departmentId.name,
        }
    ];

    if (loading) return <Spin size="large" style={{ display: "block", margin: "auto" }} />;

    return (
        <div className="page-container">
            <h2>Danh sách khoa - bộ môn</h2>
            <Table columns={columnsDepartment} dataSource={departments} rowKey="id" />
            <h2>Danh sách giáo viên</h2>
            <Table columns={columnsTeacher} dataSource={teachers} rowKey="id" />
            <h2>Danh sách môn học</h2>
            <Table columns={columnsSubject} dataSource={subjects} rowKey="id" />
        </div>
    );
};

export default TeacherList;
