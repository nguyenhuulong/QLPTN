import axios from "axios";

// Cấu hình cơ bản cho axios
const apiClient = axios.create({
    baseURL: "http://wso2-gateway-url", // Đổi thành URL của WSO2 Gateway
    headers: {
        "Content-Type": "application/json",
    },
});

// Hàm lấy danh sách giáo viên
export const getTeachers = async () => {
    try {
        const response = await apiClient.get("/teachers");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getTeachers:", error);
        throw error;
    }
};

// Hàm lấy danh sách phòng thí nghiệm
export const getLabs = async () => {
    try {
        const response = await apiClient.get("/labs");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabs:", error);
        throw error;
    }
};

// Hàm lấy lịch khai thác phòng thí nghiệm
export const getLabSchedules = async () => {
    try {
        const response = await apiClient.get("/labs/schedules");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getLabSchedules:", error);
        throw error;
    }
};
