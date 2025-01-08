import axios from "axios";
import qs from "qs";

export const getAccessToken = async () => {
    let data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': 'dCcqpjIqlI0qfDDU6HKMNh1e_L0a',
        'client_secret': 'RieEEAQst3eXomgEmQndFsVnTrUa'
    });
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://172.28.80.1:9443/oauth2/token',
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
    baseURL: "https://172.28.80.1:8243/teacher/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

const apiLabClient = axios.create({
    baseURL: "https://172.28.80.1:8243/lab/v1",
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
});

// Hàm lấy danh sách giáo viên
export const getTeachers = async () => {
    const query = `
        query MyQuery {
            getTeachers {
                id
                name
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
export const createLab = async (labData) => {
    try {
        const response = await apiLabClient.post("/labs", labData);
        console.log("LONG", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API createLab:", error);
        throw error;
    }
};

// Hàm cập nhật thông tin phòng thí nghiệm
export const updateLab = async (labId, updatedData) => {
    try {
        const response = await apiLabClient.put(`/labs/${labId}`, updatedData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gọi API updateLab với labId ${labId}:`, error);
        throw error;
    }
};

// Hàm xóa phòng thí nghiệm
export const deleteLab = async (labId) => {
    try {
        const response = await apiLabClient.delete(`/labs/${labId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gọi API deleteLab với labId ${labId}:`, error);
        throw error;
    }
};

// Hàm lấy danh sách thiết bị trong phòng thí nghiệm theo labId
export const getDevicesByLab = async (labId) => {
    try {
        console.log(labId)
        const response = await apiLabClient.get(`/labs/${labId}/devices`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gọi API getDevicesByLab với labId ${labId}:`, error);
        throw error;
    }
};

// Hàm tạo mới một phòng thí nghiệm
export const createDevice = async (labId, deviceData) => {
    try {
        const response = await apiLabClient.post(`/labs/${labId}/devices`, deviceData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API createDevice:", error);
        throw error;
    }
};

// Hàm cập nhật thiết bị trong phòng thí nghiệm
export const updateDevice = async (labId, deviceId, deviceData) => {
    try {
        const response = await apiLabClient.put(`/labs/${labId}/devices/${deviceId}`, deviceData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật thiết bị ${deviceId}:`, error);
        throw error;
    }
};

// Hàm cập nhật thiết bị trong phòng thí nghiệm
export const deleteDevice = async (labId, deviceId) => {
    try {
        const response = await apiLabClient.delete(`/labs/${labId}/devices/${deviceId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa thiết bị ${deviceId}:`, error);
        throw error;
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
export const deleteSchedule = async (labId, scheduleId) => {
    try {
        const response = await apiLabClient.delete(`/labs/${labId}/schedule/${scheduleId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa lịch  ${scheduleId}:`, error);
        throw error;
    }
};
