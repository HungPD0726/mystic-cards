

# 🔮 Website Bói Tarot - Mystic Tarot Reader

## Tổng quan
Website xem bói Tarot với phong cách **mystic/dark** hiện đại, hỗ trợ 78 lá bài chuẩn Rider-Waite, animations mượt mà, responsive mobile-first. Không cần backend — dùng mock data JSON + LocalStorage.

---

## 🎨 Thiết kế & Phong cách
- **Dark theme** mặc định với gradient tím/xanh dương nhẹ, hiệu ứng glow
- Typography rõ ràng, font style huyền bí nhưng dễ đọc
- Màu chủ đạo: tím đậm, vàng gold, nền tối
- Card design có viền gold, hiệu ứng ánh sáng khi hover
- Mobile-first, responsive cho mọi thiết bị

---

## 📱 Các màn hình chính

### 1. Trang chủ (`/`)
- Hero section với hình ảnh mystic, tiêu đề hấp dẫn và nút **"Bắt đầu xem"**
- Chọn nhanh kiểu trải bài: 1 lá / 3 lá / Yes-No
- Chọn chủ đề: Tình cảm / Công việc / Học tập
- Section giới thiệu ngắn về Tarot
- Link sang Thư viện lá bài

### 2. Chọn kiểu trải bài (`/reading`)
- Danh sách 3 spread: 1-Card, 3-Card, Yes-No
- Mỗi item hiển thị: mô tả, số lá cần rút, nút **"Chọn"**
- Card layout đẹp với icon minh họa

### 3. Bàn trải bài (`/reading/:spread`)
- Hiển thị bàn bài với các lá úp (card back)
- Nút **Shuffle**: animation xáo bài (rung/di chuyển cards)
- Nút **Draw**: lần lượt lật từng lá với flip animation
- Mỗi lá có trạng thái úp → lật, hiển thị upright hoặc reversed (random 50/50)
- Click vào lá đã lật → mở Dialog hiển thị ý nghĩa chi tiết (keywords, upright/reversed meaning, vị trí Past/Present/Future)
- Nút **"Xem kết quả"** (disabled khi chưa rút đủ lá)
- Nút **Reset** để bắt đầu lại
- Layout responsive: mobile xếp dọc, desktop xếp ngang theo spread

### 4. Kết quả (`/reading/:spread/result`)
- Hiển thị lại layout các lá đã rút
- Phần tóm tắt/kết luận (ghép từ meanings của các lá)
- Nút **"Lưu lịch sử"** → lưu vào LocalStorage + Toast thông báo
- Nút **"Chia sẻ link"** → copy URL + Toast "Đã copy link"
- Nút **"Bói lại"** → quay về chọn spread

### 5. Thư viện lá bài (`/cards`)
- Grid hiển thị 78 lá bài với ảnh + tên
- Ô tìm kiếm theo tên lá bài
- Filter theo nhóm: Major Arcana / Wands / Cups / Swords / Pentacles
- Skeleton loading khi tải
- Click vào lá → chuyển sang trang chi tiết

### 6. Chi tiết lá bài (`/cards/:slug`)
- Ảnh lá bài lớn
- Keywords, upright meaning, reversed meaning, tips/mô tả
- Breadcrumb: Thư viện → Tên lá bài

---

## 🗂️ Data Layer (Mock)
- **78 lá bài** trong file JSON: id, name, slug, imagePath, keywords, uprightMeaning, reversedMeaning, description, group (Major/Wands/Cups/Swords/Pentacles)
- **Spreads config**: định nghĩa 3 kiểu spread với positions (1-card, 3-card: Past/Present/Future, yes-no)
- **Logic rút bài**: Fisher-Yates shuffle, draw N lá không trùng, random upright/reversed 50/50
- **Ảnh**: placeholder ban đầu, bạn upload 78 ảnh sau để thay thế vào `/public/cards/`

---

## ✨ Animations & UX
- **Shuffle**: cards rung/di chuyển nhẹ với framer-motion
- **Flip**: lật lá bài 3D smooth khi reveal
- **Fade-in** cho các section khi scroll
- Toast thông báo cho các hành động (lưu, copy link)
- Button disabled states khi chưa đủ điều kiện
- Focus trap cho Dialog, aria-labels cho accessibility

---

## 💾 Lưu trữ
- Lịch sử xem bói lưu LocalStorage (đơn giản): danh sách các lần bói với ngày, spread type, các lá đã rút
- Có thể xem lại lịch sử từ trang chủ hoặc menu

