# Sử dụng hình ảnh Node.js
FROM node:16

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng React
RUN npm run build

# Sử dụng hình ảnh Nginx để phục vụ ứng dụng React
FROM nginx:1.21

# Sao chép build output của React vào thư mục phục vụ của Nginx
COPY --from=0 /app/build /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
