import axios from "axios";

const getAccessToken = async () => {
    try {
        const response = await axios.post(
            "https://172.28.80.1:9443/oauth2/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: "TKeY6io2_fdPJaEWsABJ7DfGScEa",
                client_secret: "RGq_WXPEDNLQ9nI40MmHkRKkCJ8a",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Lỗi khi lấy access token:", error);
        throw error;
    }
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

apiLabClient.interceptors.request.use(async (config) => {
    try {
        const token = await getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
        console.error("Lỗi khi thêm Authorization header:", error);
        throw error;
    }
    return config;
});

// Hàm lấy danh sách giáo viên
export const getTeachers = async () => {
    try {
        const response = await apiTeacherClient.get("/teachers");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getTeachers:", error);
        throw error;
    }
};

// Hàm lấy danh sách phòng thí nghiệm
export const getLabs = async () => {
    try {
        const response = await apiLabClient.get("/labs");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabs:", error);
        throw error;
    }
};

// Hàm lấy lịch khai thác phòng thí nghiệm
export const getLabSchedules = async () => {
    try {
        const response = await apiLabClient.get("/labs/schedules");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabSchedules:", error);
        throw error;
    }
};
