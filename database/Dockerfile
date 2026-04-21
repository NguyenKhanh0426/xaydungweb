FROM mysql:8.0

# Thiết lập database name
ENV MYSQL_DATABASE=he_thong_hoc_tieng_anh

# Thiết lập mật khẩu (Thay '123456' bằng mật khẩu của bạn)
ENV MYSQL_ROOT_PASSWORD=123456

# TỰ ĐỘNG IMPORT DỮ LIỆU:
# Câu lệnh này sẽ copy file schema.sql vào thư mục đặc biệt của MySQL Docker.
# Khi khởi động lần đầu, MySQL sẽ tự chạy file này để tạo bảng.
COPY ./schema.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
