# Ghi chú cập nhật 5 chức năng

## 1) Nhắc lịch học hằng ngày
- Thêm API CRUD cho lịch nhắc học: tạo, sửa, bật/tắt, xóa.
- Thêm trang **Nhắc học** trên frontend.
- Người dùng có thể chọn:
  - giờ nhắc
  - ngày trong tuần
  - kênh nhắc
  - nội dung nhắc
  - trạng thái bật/tắt

## 2) Theo dõi tiến độ mục tiêu
- Thêm cột `gia_tri_hien_tai` trong bảng mục tiêu.
- Thêm API cập nhật mục tiêu.
- Giao diện Goals đã hỗ trợ:
  - lọc theo trạng thái
  - cập nhật giá trị hiện tại
  - cập nhật trạng thái
  - cập nhật hạn mục tiêu
  - thanh tiến độ phần trăm
  - hiển thị số ngày còn lại

## 3) Bài test mini từ vựng
- Thêm backend tạo bài test mini từ một bộ từ.
- Hệ thống sinh câu hỏi trắc nghiệm 4 đáp án từ dữ liệu từ vựng.
- Khi nộp bài sẽ:
  - chấm điểm
  - lưu kết quả
  - lưu lịch sử lần làm bài
  - cộng EXP
  - cập nhật dashboard
- Thêm trang **Mini test** trên frontend.

## 4) Sửa / xóa bộ từ và từ vựng
- Thêm API sửa/xóa bộ từ.
- Thêm API sửa/xóa từ vựng.
- Giao diện Vocabulary đã hỗ trợ:
  - sửa bộ từ đang chọn
  - xóa bộ từ
  - sửa từ vựng
  - xóa từ vựng
  - chặn tạo flashcard trùng

## 5) Nhật ký học 4 kỹ năng
- Thêm API nhật ký kỹ năng: tạo, xem, xóa.
- Thêm trang **Nhật ký kỹ năng** trên frontend.
- Hỗ trợ ghi cho 4 kỹ năng:
  - listening
  - speaking
  - reading
  - writing
- Có thống kê nhanh số bản ghi và tổng số phút học.

## Database đổi sang tên tiếng Việt
Mình đã đổi `database/schema.sql` sang tên bảng/cột tiếng Việt không dấu để dễ nhìn, ví dụ:
- `nguoi_dung`
- `ho_so_nguoi_dung`
- `muc_tieu_nguoi_dung`
- `bo_tu_vung`
- `tu_vung`
- `the_ghi_nho`
- `nhac_nho_hoc_tap`
- `nhat_ky_ky_nang`
- `bai_kiem_tra`
- `lan_lam_bai`
- `tong_hop_hoc_tap_hang_ngay`

Đồng thời đã cập nhật backend để dùng schema mới này.

## Cần lưu ý khi chạy
- Hãy import lại file `database/schema.sql` mới.
- Đặt `DB_NAME=he_thong_hoc_tieng_anh` trong file `.env` backend.
- File `backend/.env.example` và `database/Dockerfile` cũng đã đổi theo tên database mới.

## Kiểm tra kỹ thuật đã làm
- Đã kiểm tra cú pháp toàn bộ backend bằng `node --check`.
- Đã kiểm tra cú pháp frontend bằng parser JSX.
- Chưa build Vite hoàn chỉnh trong môi trường này vì `node_modules` đi kèm thiếu optional dependency đúng nền tảng Linux của Rollup/Vite.
  - Nếu chạy local, nên xóa `node_modules` cũ và cài lại dependencies để build bình thường.
