import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Table, Spin, message, Button, Modal, Form, Input, Popconfirm, Space, Select, TimePicker } from "antd";
import { PlusOutlined } from '@ant-design/icons';

import { getTeachers, getLabs, getLabSchedules, getDevicesByLab, updateLab, updateDevice, deleteDevice, createDevice, createLab, deleteLab, createSchedule, deleteSchedule, getSubjects } from "../services/api";
import { getClientRoles, getUserName, loadUserProfile } from "../keycloak";

const LabManagement = () => {
    const [user, setUser] = useState(null);

    const [role, setRole] = useState(null);

    const [labs, setLabs] = useState([]);

    const [subjects, setSubjects] = useState([]);

    const [teachers, setTeachers] = useState([]);

    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(true);

    const [reload, setReload] = useState(true);

    const [selectedLab, setSelectedLab] = useState(null);

    const [devices, setDevices] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    const [newDevice, setNewDevice] = useState({
        name: "",
        type: "",
        status: "",
        manufacturer: "",
    });

    const [isAddLabModalVisible, setIsAddLabModalVisible] = useState(false);

    const [newLab, setNewLab] = useState({
        name: "",
        location: "",
        capacity: 0,
    });

    const [isAddScheduleModalVisible, setIsAddScheduleModalVisible] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        labId: "",
        date: "",
        timeSlot: "",
        reservedBy: "",
        purpose: "",
        seminarContent: "",
        subjectId: "",
    });

    const [form] = Form.useForm();

    const [form2] = Form.useForm();

    const [form3] = Form.useForm();

    const [form4] = Form.useForm();

    useEffect(() => {
        const userAccount = getUserName();
        setUser(userAccount);
        const userRole = getClientRoles();
        setRole(userRole[0])
    }, [])

    useEffect(() => {
        const fetchLabsAndSchedules = async () => {
            try {
                const teacherData = await getTeachers();
                setTeachers(teacherData);

                const labData = await getLabs();
                const sortedLabs = labData.sort((a, b) => a.name.localeCompare(b.name));
                setLabs(sortedLabs);

                const scheduleData = await getLabSchedules();
                setSchedules(scheduleData);

                const subjectData = await getSubjects();
                setSubjects(subjectData);
            } catch (error) {
                message.error("Lỗi khi tải thông tin phòng thí nghiệm.");
            } finally {
                setLoading(false);
            }
        };
        fetchLabsAndSchedules();
    }, [reload]);

    const handleEditLab = async (lab) => {
        try {
            setSelectedLab(lab);
            setIsModalVisible(true);
            const devicesData = await getDevicesByLab(lab._id);
            setDevices(devicesData);
            form.setFieldsValue(lab);
        } catch (error) {
            message.error("Lỗi khi tải thông tin chi tiết phòng lab.");
        }
    };

    const handleDeleteLab = async (labId) => {
        const response = await deleteLab(role, labId)
        if (response.error) {
            message.error(response.error);
            return;
        }
        message.success("Xóa phòng lab thành công!");
        setReload(!reload)
    };

    const handleSave = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values)
                const updatedLab = await updateLab(role, selectedLab._id, form.getFieldsValue());
                if (updatedLab.error) {
                    message.error(updatedLab.error); // Hiển thị thông báo lỗi
                    return;
                }
                const updatePromises = devices.map((device) =>
                    updateDevice(role, selectedLab._id, device._id, device)
                );
                message.success("Cập nhật thành công!");
                setDevices([]);
                setReload(!reload)
                setIsModalVisible(false);
            })
            .catch((info) => {
                console.error("Validate Failed:", info);
            });
    };

    const handleCancel = () => {
        setDevices([]);
        setIsModalVisible(false);
        form.resetFields();
    };

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
        {
            title: "Sức chứa",
            dataIndex: "capacity",
            key: "capacity",
        },
        {
            title: "Hành động",
            key: "actions",
            render: (text, record) => (
                <>
                    <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleEditLab(record)}
                    >
                        Chi tiết
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phòng thí nghiệm này?"
                        onConfirm={() => handleDeleteLab(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const handleAddDevice = async () => {
        const data = await createDevice(role, selectedLab._id, newDevice)
        if (data.error) {
            message.error(data.error); // Hiển thị thông báo lỗi
            return;
        }
        message.success("Thêm thiết bị thành công!");
        setIsAddModalVisible(false);
        setDevices([]);
        setIsModalVisible(false);
    };

    const handleDeleteDevice = (deviceId) => {
        Modal.confirm({
            title: "Xác nhận xóa thiết bị",
            content: "Bạn có chắc chắn muốn xóa thiết bị này không?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                const response = await deleteDevice(role, selectedLab._id, deviceId)
                if (response.error) {
                    message.error(response.error);
                    return;
                }
                message.success("Xóa thiết bị thành công!");
                setDevices([]);
                setIsModalVisible(false);
            }
        });
    };

    const deviceColumns = [
        {
            title: "Tên thiết bị",
            dataIndex: "name",
            key: "name",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => updateDeviceField(index, "name", e.target.value)}
                />
            ),
        },
        {
            title: "Loại thiết bị",
            dataIndex: "type",
            key: "type",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => updateDeviceField(index, "type", e.target.value)}
                />
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => updateDeviceField(index, "status", e.target.value)}
                />
            ),
        },
        {
            title: "Nhà sản xuất",
            dataIndex: "manufacturer",
            key: "manufacturer",
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => updateDeviceField(index, "manufacturer", e.target.value)}
                />
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteDevice(record._id)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    const updateDeviceField = (index, field, value) => {
        setDevices((prev) =>
            prev.map((device, i) => (i === index ? { ...device, [field]: value } : device))
        );
    };

    if (loading) return <Spin size="large" style={{ display: "block", margin: "auto" }} />;

    const handleAddLab = async () => {
        try {
            const values = await form3.validateFields(); // Kiểm tra các trường form
            const response = await createLab(role, values); // Gọi API
            if (response.error) {
                message.error(response.error); // Hiển thị thông báo lỗi
                return;
            }
            // Thành công
            message.success("Thêm phòng thí nghiệm thành công!");
            setReload(!reload);
            setIsAddLabModalVisible(false);
            form3.resetFields();
        } catch (error) {
            // Xử lý lỗi bất ngờ
            message.error("Vui lòng kiểm tra thông tin nhập vào!");
            console.error("Lỗi không mong đợi:", error);
        }
    };

    const getMappedSchedules = () => {
        return schedules
            .map((schedule) => {
                const lab = labs.find((lab) => lab._id === schedule.labId);
                const teacher = teachers.find((teacher) => teacher.id === schedule.reservedBy);
                const subject = subjects.find((subject) => subject.id === schedule.subjectId);
                return {
                    id: schedule._id,
                    labName: lab ? lab.name : "Không xác định",
                    date: schedule.date,
                    time: schedule.timeSlot,
                    teacherName: teacher ? teacher.name : "Không xác định",
                    content:
                        schedule.purpose === "seminar"
                            ? `Seminar: ${schedule.seminarContent}`
                            : schedule.purpose === "teaching"
                                ? `Dạy học: ${subject.name}`
                                : "Khác",
                    labId: schedule.labId,
                    reservedBy: schedule.reservedBy,
                };
            })
            .sort((a, b) => {
                // So sánh date giảm dần
                if (b.date !== a.date) {
                    return b.date.localeCompare(a.date); // Date giảm dần
                }

                // Nếu date giống nhau, so sánh theo time giảm dần
                return b.time.localeCompare(a.time); // Time giảm dần
            });
    };

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
            title: "Khung giờ",
            dataIndex: "time",
            key: "time",
        },
        {
            title: "Giáo viên",
            dataIndex: "teacherName",
            key: "teacherName",
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc chắn muốn xóa lịch này?"
                    onConfirm={() => handleDeleteSchedule(record, record.labId, record.reservedBy)} // Truyền thêm labId và reservedBy vào đây
                    okText="Có"
                    cancelText="Không"
                >
                    <Button danger>Xóa</Button>
                </Popconfirm>
            ),
        }
    ];

    const handleAddSchedule = async () => {
        try {
            if (!newSchedule.startTime || !newSchedule.endTime) {
                message.error("Vui lòng chọn đầy đủ khung giờ.");
                return;
            }
            const scheduleData = {
                labId: newSchedule.labId,
                date: newSchedule.date,
                timeSlot: `${newSchedule.startTime}-${newSchedule.endTime}`,
                reservedBy: newSchedule.reservedBy,
                purpose: newSchedule.purpose,
                seminarContent: newSchedule.seminarContent,
                subjectId: newSchedule.subjectId,
            };
            const values = await form4.validateFields();
            const response = await createSchedule(newSchedule.labId, scheduleData);
            message.success("Thêm lịch thành công!");
            setIsAddScheduleModalVisible(false);
            setReload(!reload);
            form4.resetFields();
        } catch (error) {
            message.error("Lỗi khi thêm lịch!");
        }
    };
    const handleDeleteSchedule = async (schedule, labId, reservedBy) => {
        try {
            const response = await deleteSchedule(role, user, reservedBy, labId, schedule.id);
            if (response.error) {
                message.error(response.error); // Hiển thị thông báo lỗi
                return;
            }
            message.success("Xóa lịch thành công!");
            setReload(!reload);
        } catch (error) {
            message.error("Lỗi khi xóa lịch!");
        }
    };

    return (
        <div className="page-container">
            <Space align="center">
                <h2>Danh sách phòng thí nghiệm</h2>
                <Button
                    type="primary"
                    onClick={() => setIsAddLabModalVisible(true)}
                    style={{ marginBottom: "16px" }}
                    icon={<PlusOutlined />}
                >
                    Thêm
                </Button>
            </Space>
            <Table
                columns={labColumns}
                dataSource={labs}
                rowKey="id"
                style={{ marginBottom: "24px" }}
            />
            <Space align="center">
                <h2>Lịch khai thác</h2>
                <Button
                    type="primary"
                    onClick={() => {
                        const reservedBy = role === "admin"
                            ? "" // admin thì không cần điền sẵn giáo viên
                            : teachers.find((teacher) => teacher.account === user)?.id; // user thì chọn giáo viên theo account

                        // Cập nhật giá trị của reservedBy vào initialValues
                        setNewSchedule((prev) => ({ ...prev, reservedBy }));
                        setIsAddScheduleModalVisible(true)
                    }}
                    style={{ marginBottom: "16px" }}
                    icon={<PlusOutlined />}
                >
                    Thêm
                </Button>
            </Space>
            <Table
                columns={scheduleColumns}
                dataSource={getMappedSchedules()}
                rowKey="id"
            />
            <Modal
                width={800}
                title="Chỉnh sửa thông tin phòng thí nghiệm"
                open={isModalVisible}
                onOk={handleSave}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên phòng thí nghiệm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Vị trí"
                        name="location"
                        rules={[{ required: true, message: "Vui lòng nhập vị trí!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Sức chứa"
                        name="capacity"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập sức chứa!",
                            },
                            {
                                type: "number",
                                min: 1,
                                message: "Sức chứa phải lớn hơn 0!",
                                transform: (value) => Number(value),
                            },
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
                <h3>Danh sách thiết bị</h3>
                <Table
                    columns={deviceColumns}
                    dataSource={devices}
                    rowKey="id"
                    pagination={false}
                />
                <Button
                    type="dashed"
                    onClick={() => setIsAddModalVisible(true)}
                    style={{ marginTop: "16px" }}
                >
                    Thêm thiết bị
                </Button>
            </Modal>
            <Modal
                title="Thêm thiết bị mới"
                open={isAddModalVisible}
                onOk={handleAddDevice}
                onCancel={() => setIsAddModalVisible(false)}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form2} layout="vertical">
                    <Form.Item
                        label="Tên thiết bị"
                    >
                        <Input
                            value={newDevice.name}
                            onChange={(e) =>
                                setNewDevice((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Loại thiết bị">
                        <Input
                            value={newDevice.type}
                            onChange={(e) =>
                                setNewDevice((prev) => ({ ...prev, type: e.target.value }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Trạng thái">
                        <Input
                            value={newDevice.status}
                            onChange={(e) =>
                                setNewDevice((prev) => ({ ...prev, status: e.target.value }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Nhà sản xuất">
                        <Input
                            value={newDevice.manufacturer}
                            onChange={(e) =>
                                setNewDevice((prev) => ({
                                    ...prev,
                                    manufacturer: e.target.value,
                                }))
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Thêm phòng thí nghiệm mới"
                open={isAddLabModalVisible}
                onOk={handleAddLab}
                onCancel={() => setIsAddLabModalVisible(false)}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form3} layout="vertical">
                    <Form.Item
                        label="Tên phòng thí nghiệm"
                        name="name" // Thêm name để liên kết với form
                        rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
                    >
                        <Input
                            value={newLab.name}
                            onChange={(e) =>
                                setNewLab((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Vị trí"
                        name="location" // Thêm name để liên kết với form
                        rules={[{ required: true, message: "Vui lòng nhập vị trí!" }]}
                    >
                        <Input
                            value={newLab.location}
                            onChange={(e) =>
                                setNewLab((prev) => ({ ...prev, location: e.target.value }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Sức chứa"
                        name="capacity" // Thêm name để liên kết với form
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập sức chứa!",
                            },
                            {
                                type: "number",
                                min: 1,
                                message: "Sức chứa phải lớn hơn 0!",
                                transform: (value) => Number(value),
                            },
                        ]}
                    >
                        <Input
                            type="number"
                            value={newLab.capacity}
                            onChange={(e) =>
                                setNewLab((prev) => ({
                                    ...prev,
                                    capacity: Number(e.target.value),
                                }))
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Thêm lịch khai thác"
                open={isAddScheduleModalVisible}
                onOk={handleAddSchedule}
                onCancel={() => {
                    setIsAddScheduleModalVisible(false)
                }}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form4} layout="vertical" initialValues={newSchedule}>
                    <Form.Item
                        label="Phòng thí nghiệm"
                        name="labId"
                        rules={[{ required: true, message: "Vui lòng chọn phòng thí nghiệm" }]} // Validation
                    >
                        <Select
                            value={newSchedule.labId}
                            onChange={(value) =>
                                setNewSchedule((prev) => ({ ...prev, labId: value }))
                            }
                        >
                            {labs.map((lab, index) => (
                                <Select.Option key={index} value={lab._id}>
                                    {lab.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ngày"
                        name="date"
                        rules={[{ required: true, message: "Vui lòng chọn ngày" }]} // Validation
                    >
                        <Input
                            type="date"
                            value={newSchedule.date}
                            onChange={(e) =>
                                setNewSchedule((prev) => ({ ...prev, date: e.target.value }))
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Khung giờ"
                        name="timeSlot"
                    >
                        <div style={{ display: "flex", gap: "8px" }}>
                            <TimePicker
                                value={newSchedule.startTime ? dayjs(newSchedule.startTime, "HH:mm") : null}
                                format="HH:mm"
                                onChange={(time, timeString) => {
                                    setNewSchedule((prev) => {
                                        const newStartTime = timeString;
                                        const newEndTime = prev.endTime; // giữ nguyên endTime cũ

                                        // Kiểm tra nếu startTime > endTime
                                        if (newEndTime && dayjs(newStartTime, "HH:mm").isAfter(dayjs(newEndTime, "HH:mm"))) {
                                            message.error("Khung giờ bắt đầu không thể lớn hơn khung giờ kết thúc.");
                                            return prev; // không cập nhật nếu không hợp lệ
                                        }

                                        const newTimeSlot = `${newStartTime}-${newEndTime || newStartTime}`; // tạo timeSlot

                                        return {
                                            ...prev,
                                            startTime: newStartTime,
                                            timeSlot: newTimeSlot, // cập nhật timeSlot
                                        };
                                    });
                                }}
                            />
                            <span>-</span>
                            <TimePicker
                                value={newSchedule.endTime ? dayjs(newSchedule.endTime, "HH:mm") : null}
                                format="HH:mm"
                                onChange={(time, timeString) => {
                                    setNewSchedule((prev) => {
                                        const newEndTime = timeString;
                                        const newStartTime = prev.startTime; // giữ nguyên startTime cũ

                                        // Kiểm tra nếu startTime > endTime
                                        if (newStartTime && dayjs(newEndTime, "HH:mm").isBefore(dayjs(newStartTime, "HH:mm"))) {
                                            message.error("Khung giờ kết thúc không thể nhỏ hơn khung giờ bắt đầu.");
                                            return prev; // không cập nhật nếu không hợp lệ
                                        }

                                        const newTimeSlot = `${newStartTime || newEndTime}-${newEndTime}`; // tạo timeSlot

                                        return {
                                            ...prev,
                                            endTime: newEndTime,
                                            timeSlot: newTimeSlot, // cập nhật timeSlot
                                        };
                                    });
                                }}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item
                        label="Giáo viên"
                        name="reservedBy"
                        rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]} // Validation
                    >
                        <Select
                            value={
                                role === 'admin'
                                    ? newSchedule.reservedBy
                                    : teachers.find((teacher) => teacher.account === user).id // Nếu là user, chọn giáo viên có account trùng với user.account
                            }
                            onChange={(value) =>
                                setNewSchedule((prev) => ({ ...prev, reservedBy: value }))
                            }
                            disabled={role !== 'admin'}
                        >
                            {teachers.map((teacher, index) => (
                                <Select.Option key={index} value={teacher.id}>
                                    {teacher.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Mục đích"
                        name="purpose"
                        rules={[{ required: true, message: "Vui lòng chọn mục đích" }]} // Validation
                    >
                        <Select
                            value={newSchedule.purpose}
                            onChange={(value) =>
                                setNewSchedule((prev) => ({ ...prev, purpose: value }))
                            }
                        >
                            <Select.Option value="seminar">Seminar</Select.Option>
                            <Select.Option value="teaching">Dạy học</Select.Option>
                        </Select>
                    </Form.Item>

                    {newSchedule.purpose === "seminar" && (
                        <Form.Item
                            label="Nội dung seminar"
                            name="seminarContent"
                            rules={[{ required: true, message: "Vui lòng nhập nội dung seminar" }]} // Validation
                        >
                            <Input
                                value={newSchedule.seminarContent}
                                onChange={(e) =>
                                    setNewSchedule((prev) => ({
                                        ...prev,
                                        seminarContent: e.target.value,
                                    }))
                                }
                            />
                        </Form.Item>
                    )}

                    {newSchedule.purpose === "teaching" && (
                        <Form.Item
                            label="Môn học"
                            name="subjectId"
                            rules={[{ required: true, message: "Vui lòng chọn mã môn học" }]} // Validation
                        >
                            <Select
                                value={newSchedule.subjectId}
                                onChange={(value) =>
                                    setNewSchedule((prev) => ({
                                        ...prev,
                                        subjectId: value,
                                    }))
                                }
                            >
                                {subjects.map((subject) => (
                                    <Select.Option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default LabManagement;
