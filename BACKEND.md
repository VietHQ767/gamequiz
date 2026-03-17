# Kết nối Frontend với Backend

## Cấu hình Backend

- Backend chạy tại **http://localhost:3000** (theo `.env` PORT=3000).
- Frontend (Vite) chạy tại **http://localhost:3001** và proxy `/api` → `http://localhost:3000`.

## CORS

Nếu bạn chạy FE và BE tách biệt (không dùng proxy), backend cần cho phép origin của FE. Trong `app.js` của BE, thêm vào `allowedOrigins`:

```js
"http://localhost:3001"
```

Hoặc trong `.env` của BE:

```
CLIENT_URL=http://localhost:3001
```

## API mà FE đang gọi

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/login` | Body: `{ username, password }` → `{ user, token }` |
| POST | `/api/signup` | Body: `{ username, password }` → `{ user, token }` |
| POST | `/api/logout` | Header: `Authorization: Bearer <token>` (invalidate token) |
| GET | `/api/questions` | Trả về mảng questions (field `text` cho nội dung câu hỏi) |
| GET | `/api/questions/:id` | Chi tiết một question |
| POST | `/api/questions` | Body: `{ text, options, correctAnswerIndex }` (Author do BE gán từ req.user) |
| PUT | `/api/questions/:id` | Body: `{ text?, options?, correctAnswerIndex? }` |
| DELETE | `/api/questions/:id` | Xóa question |

## Định dạng lỗi BE

FE mong đợi lỗi dạng:

```json
{ "success": false, "message": "Nội dung lỗi" }
```

## User từ BE

- Login/Signup trả về `user` có field **`admin`** (boolean). FE tự suy `role`: `admin === true` → admin, ngược lại → user.
