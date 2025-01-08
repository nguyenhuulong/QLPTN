import axios from "axios";
import qs from "qs";

const checkPermission = (role) => {
    return role === "admin";
};

export const getAccessToken = async () => {
    let data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': 'dCcqpjIqlI0qfDDU6HKMNh1e_L0a',
        'client_secret': 'RieEEAQst3eXomgEmQndFsVnTrUa'
    });
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://172.23.128.1:9443/oauth2/token',
        data: data
    };
    try {
        const response = await axios.request(config);
        const accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;
        const expirationDate = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('token_expiration', expirationDate.toString());
        return accessToken;
    } catch (error) {
        console.log("Error fetching access token:", error);
        throw error;
    }
};

export const getStoredAccessToken = () => {
    const token = localStorage.getItem('access_token');
    const expirationDate = localStorage.getItem('token_expiration');
    if (token && expirationDate) {
        const currentTime = new Date().getTime();
        if (currentTime < parseInt(expirationDate)) {
            return token;
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_expiration');
        }
    }
    return null;
};

export const getToken = async () => {
    let token = getStoredAccessToken();
    if (!token) {
        token = await getAccessToken();
    }

    return token;
};

// Cấu hình cơ bản cho axios
const apiTeacherClient = axios.create({
    baseURL: "https://172.23.128.1:8243/teacher/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

const apiLabClient = axios.create({
    baseURL: "https://172.23.128.1:8243/lab/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

apiTeacherClient.interceptors.request.use(async (config) => {
    try {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Lỗi khi thêm Authorization header:", error);
        throw error;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiLabClient.interceptors.request.use(async (config) => {
    try {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Lỗi khi thêm Authorization header:", error);
        throw error;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiTeacherClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                const newToken = await getAccessToken();
                if (newToken) {
                    error.config.headers['Authorization'] = `Bearer ${newToken}`;
                    return axios.request(error.config);
                }
            } catch (error) {
                console.error("Lỗi khi lấy token mới:", error);
            }
        }
        return Promise.reject(error);
    }
);

apiLabClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                const newToken = await getAccessToken();
                if (newToken) {
                    error.config.headers['Authorization'] = `Bearer ${newToken}`;
                    return axios.request(error.config);
                }
            } catch (error) {
                console.error("Lỗi khi lấy token mới:", error);
            }
        }
        return Promise.reject(error);
    }
);

// Hàm lấy danh sách giáo viên
export const getTeachers = async () => {
    const query = `
        query MyQuery {
            getTeachers {
                id
                name
                account
                departmentId {
                    id
                    name
                }
            }
        }
    `;
    try {
        const response = await apiTeacherClient.post("/", {
            query: query,
        });
        return response.data.data.getTeachers;
    } catch (error) {
        console.error("Lỗi khi gọi API getTeachers:", error);
        throw error;
    }
};

// Hàm lấy danh sách môn học
export const getSubjects = async () => {
    const query = `
        query MyQuery {
            getSubjects {
                id
                name
                departmentId { id name }
            }
        }
    `;
    try {
        const response = await apiTeacherClient.post("/", {
            query: query,
        });
        return response.data.data.getSubjects;
    } catch (error) {
        console.error("Lỗi khi gọi API getSubjects:", error);
        throw error;
    }
};

// Hàm lấy danh sách giáo viên
export const getDepartments = async () => {
    const query = `
        query MyQuery {
            getDepartments {
                id
                name
                teachers {
                    id
                    name
                    account
                }
                subjects {
                    id
                    name
                }
            }
        }
    `;
    try {
        const response = await apiTeacherClient.post("/", {
            query: query,
        });
        return response.data.data.getDepartments;
    } catch (error) {
        console.error("Lỗi khi gọi API getDepartments:", error);
        throw error;
    }
};

// Hàm lấy danh sách phòng thí nghiệm
export const getLabs = async () => {
    try {
        const response = await apiLabClient.get("/labs");
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabs:", error);
        throw error;
    }
};

// Hàm tạo mới một phòng thí nghiệm
export const createLab = async (userRole, labData) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.post("/labs", labData);
        return { data: response.data };
    } catch (error) {
        console.error("Lỗi khi gọi API createLab:", error);
        return { error: "Lỗi khi gọi API createLab. Vui lòng thử lại sau!" };
    }
};

// Hàm cập nhật thông tin phòng thí nghiệm
export const updateLab = async (userRole, labId, updatedData) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.put(`/labs/${labId}`, updatedData);
        return { data: response.data };
    } catch (error) {
        console.error(`Lỗi khi gọi API updateLab:`, error);
        throw { error: "Lỗi khi gọi API updateLab. Vui lòng thử lại sau!" };
    }
};

// Hàm xóa phòng thí nghiệm
export const deleteLab = async (userRole, labId) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.delete(`/labs/${labId}`);
        return { data: response.data };
    } catch (error) {
        console.error(`Lỗi khi gọi API deleteLab:`, error);
        throw { error: "Lỗi khi gọi API deleteLab. Vui lòng thử lại sau!" };
    }
};

// Hàm lấy danh sách thiết bị trongg thí nghiệm theo labId
export const getDevicesByLab = async (labId) => {
    try {
        console.log(labId)
        const response = await apiLabClient.get(`/labs/${labId}/devices`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gọi API getDevicesByLab:`, error);
        throw error;
    }
};

// Hàm tạo mới một phòng thí nghiệm
export const createDevice = async (userRole, labId, deviceData) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.post(`/labs/${labId}/devices`, deviceData);
        return { data: response.data };
    } catch (error) {
        console.error('Lỗi khi gọi API createDevice:', error);
        throw { error: "Lỗi khi gọi API createDevice. Vui lòng thử lại sau!" };
    }
};

// Hàm cập nhật thiết bị trong phòng thí nghiệm
export const updateDevice = async (userRole, labId, deviceId, deviceData) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.put(`/labs/${labId}/devices/${deviceId}`, deviceData);
        return { data: response.data };
    } catch (error) {
        console.error(`Lỗi khi gọi API updateDevice:`, error);
        throw { error: "Lỗi khi gọi API updateDevice. Vui lòng thử lại sau!" };
    }
};

// Hàm cập nhật thiết bị trong phòng thí nghiệm
export const deleteDevice = async (userRole, labId, deviceId) => {
    if (!checkPermission(userRole)) {
        return { error: "Bạn không có quyền thực hiện hành động này!" };
    }
    try {
        const response = await apiLabClient.delete(`/labs/${labId}/devices/${deviceId}`);
        return { data: response.data };
    } catch (error) {
        console.error(`Lỗi khi gọi API deleteDevice:`, error);
        throw { error: "Lỗi khi gọi API deleteDevice. Vui lòng thử lại sau!" };
    }
};

// Hàm lấy lịch khai thác phòng thí nghiệm
export const getLabSchedules = async () => {
    try {
        const response = await apiLabClient.get("/schedules");
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabSchedules:", error);
        throw error;
    }
};

// Hàm lấy lịch khai thác phòng thí nghiệm
export const createSchedule = async (labId, scheduleData) => {
    try {
        const response = await apiLabClient.post(`/labs/${labId}/schedule`, scheduleData);
        console.log(response.data)
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi API:", error.response.data.message || error.response.statusText);
            throw new Error(error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } else {
            console.error("Lỗi khi gọi API createSchedule:", error);
            throw error
        }
    }
};

// Hàm cập nhật thiết bị trong phòng thí nghiệm
export const deleteSchedule = async (role, user, reserved, labId, scheduleId) => {
    console.log(role, user, reserved, labId, scheduleId)
    if (role === 'admin') {
        // Nếu là admin thì cho phép xóa ngay
        const response = await apiLabClient.delete(`/labs/${labId}/schedule/${scheduleId}`);
        return { data: response.data };
    } else if (role === 'user') {
        // Nếu là user, cần kiểm tra account của teacher
        const teachers = await getTeachers(); // Lấy danh sách teachers
        const teacher = teachers.find(t => t.id === reserved); // Tìm teacher có id là reserved
        console.log(teacher)
        if (teacher && teacher.account === user) {
            // Nếu teacher có account trùng với user, cho phép xóa
            const response = await apiLabClient.delete(`/labs/${labId}/schedule/${scheduleId}`);
            return { data: response.data };
        } else {
            // Nếu không có quyền xóa
            return { error: "Bạn không có quyền thực hiện hành động này!" };
        }
    } else {
        // Nếu role không hợp lệ
        return { error: "Role không hợp lệ!" };
    }
};