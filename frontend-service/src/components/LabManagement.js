import React, { useState, useEffect } from "react";
import { Table, Spin, message } from "antd";

import { getLabs, getLabSchedules } from "../services/api";

const LabManagement = () => {
    const [labs, setLabs] = useState([]);

    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabsAndSchedules = async () => {
            try {
                const labData = await getLabs();
                const scheduleData = await getLabSchedules();
                console.log(labData)
                setLabs(labData);
                setSchedules(scheduleData);
            } catch (error) {
                message.error("Lỗi khi tải thông tin phòng thí nghiệm.");
            } finally {
                setLoading(false);
            }
        };
        fetchLabsAndSchedules();
    }, []);

    const labColumns = [
        {
            title: "Tên phòng thí nghiệm",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Vị trí",
            dataIndex: "location",
            key: "location",
        },
    ];

    const scheduleColumns = [
        {
            title: "Phòng thí nghiệm",
            dataIndex: "labName",
            key: "labName",
        },
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Thời gian",
            dataIndex: "time",
            key: "time",
        },
    ];

    if (loading) return <Spin size="large" style={{ display: "block", margin: "auto" }} />;

    return (
        <div className="page-container">
            <h2>Danh sách phòng thí nghiệm</h2>
            <Table columns={labColumns} dataSource={labs} rowKey="id" style={{ marginBottom: "24px" }} />
            <h2>Lịch khai thác</h2>
            <Table columns={scheduleColumns} dataSource={schedules} rowKey="id" />
        </div>
    );
};

export default LabManagement;
