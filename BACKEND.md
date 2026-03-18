# Kết nối Frontend với Backend

## Cấu hình hiện tại

| | URL |
|--|-----|
| **Backend (API)** | `https://bequiz.onrender.com` (Render) |
| **Frontend** | `https://gamequiz-liard.vercel.app` (Vercel) |

- **FE `.env`:** `VITE_API_URL=https://bequiz.onrender.com/api` → `src/api/client.ts` dùng biến này làm base URL.
- **BE CORS:** Backend set `CLIENT_URL=https://gamequiz-liard.vercel.app` để cho phép request từ FE.

**Chạy local:** Giữ `VITE_API_URL` trong `.env` = gọi thẳng Render. Để dùng BE local, xóa/comment `VITE_API_URL` → FE dùng `/api` (proxy trong `vite.config.ts` tới localhost:3000).

## API mà FE đang gọi

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/login` | Body: `{ username, password }` → `{ user, token }` |
| POST | `/api/signup` | Body: `{ username, password }` → `{ user, token }` |
| POST | `/api/logout` | Header: `Authorization: Bearer <token>` (invalidate token) |
| GET | `/api/quizzes` | Trả về mảng quizzes (mỗi item: `_id`, `title?`, `questions?`) |
| GET | `/api/quizzes/:id` | Chi tiết một quiz (kèm `questions` là mảng question). Dùng cho trang "Questions: [quiz]". |
| GET | `/api/quizzes/:quizId/populate` | (Tùy chọn) Cùng dữ liệu có populate questions. |
| POST | `/api/quizzes/:quizId/question` | Body: `{ "questionId": "<id>" }` → gắn câu hỏi vào quiz (gọi sau POST /questions). |
| POST | `/api/quizzes` | Body: `{ title }` → tạo quiz mới (Admin) |
| PUT | `/api/quizzes/:id` | Body: `{ title? }` → cập nhật quiz (Admin) |
| DELETE | `/api/quizzes/:id` | Xóa quiz (Admin) |
| GET | `/api/questions` | Trả về mảng questions (field `text` cho nội dung câu hỏi) |
| GET | `/api/questions?quizId=xxx` | (Tùy chọn) Trả về questions thuộc quiz đó. Nếu không có, FE dùng GET `/api/quizzes/:id` để lấy questions. |
| GET | `/api/questions/:id` | Chi tiết một question |
| POST | `/api/questions` | Body: `{ text, options, correctAnswerIndex, quizId? }` (Author do BE gán từ req.user; quizId để gán question vào quiz) |
| PUT | `/api/questions/:id` | Body: `{ text?, options?, correctAnswerIndex? }` |
| DELETE | `/api/questions/:id` | Xóa question |

## Định dạng lỗi BE

FE mong đợi lỗi dạng:

```json
{ "success": false, "message": "Nội dung lỗi" }
```

## User từ BE

- Login/Signup trả về `user` có field **`admin`** (boolean). FE tự suy `role`: `admin === true` → admin, ngược lại → user.
