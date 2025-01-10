import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "base-realm",
    clientId: "base-client",
});

// Hàm khởi tạo Keycloak
export const initKeycloak = (onAuthenticatedCallback) => {
    keycloak.init({ onLoad: "login-required", checkLoginIframe: false })
        .then(authenticated => {
            if (authenticated) {
                onAuthenticatedCallback();
            } else {
                window.location.reload();
            }
        })
        .catch(() => window.location.reload());
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const keycloakAuthenticated = () => {
    return keycloak.authenticated; 
};

// Lấy danh sách Client Role
export const getClientRoles = () => {
    return keycloak.tokenParsed?.resource_access?.["base-client"]?.roles || [];
};

// Đăng xuất
export const keycloakLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
};

// Lấy token của người dùng
export const getToken = () => {
    return keycloak.token;
};

// Lấy thông tin người dùng
export const loadUserProfile = () => {
    return keycloak.loadUserProfile();
};

// Lấy thông tin user name
export const getUserName = () => {
    return keycloak.tokenParsed?.preferred_username;
};

export default keycloak;
