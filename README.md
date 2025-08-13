# Sentra API Documentation

## Overview

API Sentra adalah back-end berbasis Express.js yang menyediakan fitur autentikasi, deteksi warna gambar, chatbot AI, dan manajemen riwayat warna. Semua endpoint menggunakan format JSON dan sebagian besar membutuhkan autentikasi Bearer Token.

API Base URL: `https://api-sentra.onrender.com/`

---

## Authentication

### Register User

`POST /api/auth/register`

| FieldName | Required | Type   | Length  | Description       |
| :-------- | :------- | :----- | :------ | :---------------- |
| name      | true     | string | max:50  | Nama pengguna     |
| email     | true     | string | max:100 | Email pengguna    |
| password  | true     | string | min:6   | Password pengguna |

### Login User

`POST /api/auth/login`

| FieldName | Required | Type   | Length  | Description       |
| :-------- | :------- | :----- | :------ | :---------------- |
| email     | true     | string | max:100 | Email pengguna    |
| password  | true     | string | min:6   | Password pengguna |

### Verify Email

`POST /api/auth/verify-email`

| FieldName        | Required | Type   | Description               |
| :--------------- | :------- | :----- | :------------------------ |
| email            | true     | string | Email pengguna            |
| verificationCode | true     | string | Kode verifikasi (6 digit) |

### Resend Verification Code

`POST /api/auth/resend-code`

| FieldName | Required | Type   | Description    |
| :-------- | :------- | :----- | :------------- |
| email     | true     | string | Email pengguna |

### Get Profile

`GET /api/auth/me`

Header: `Authorization: Bearer <token>`

### Update Profile

`PUT /api/auth/me/update-name`

| FieldName | Required | Type   | Description |
| :-------- | :------- | :----- | :---------- |
| name      | true     | string | Nama baru   |

### Update Password

`PUT /api/auth/me/update-password`

| FieldName | Required | Type   | Description   |
| :-------- | :------- | :----- | :------------ |
| password  | true     | string | Password baru |

### Delete Account

`DELETE /api/auth/me/delete`

Header: `Authorization: Bearer <token>`

### Forget Password

`POST /api/auth/forget-password`

| FieldName | Required | Type   | Description    |
| :-------- | :------- | :----- | :------------- |
| email     | true     | string | Email pengguna |

### Verify Forget Password

`POST /api/auth/forget-password/verify`

| FieldName        | Required | Type   | Description     |
| :--------------- | :------- | :----- | :-------------- |
| email            | true     | string | Email pengguna  |
| verificationCode | true     | string | Kode verifikasi |

### New Password

`POST /api/auth/forget-password/new-password`

| FieldName | Required | Type   | Description   |
| :-------- | :------- | :----- | :------------ |
| password  | true     | string | Password baru |

---

## Colors

### Detect Color from Image

`POST /api/colors/detect-color`

Header: `Authorization: Bearer <token>`

Form-data:

- image: file (jpg/png/jpeg/gif, max 5MB)

Response:

```json
{
  "message": "Warna berhasil dideteksi",
  "colors": [
    {
      "hex": "#FFFFFF",
      "hsl": "hsl(0, 0%, 100%)",
      "rgb": "rgb(255,255,255)",
      "name": "White"
    }
  ]
}
```

### Get All Color History

`GET /api/colors/history`

Header: `Authorization: Bearer <token>`

Response:

```json
{
  "data": [ { ...ColorHistory } ]
}
```

### Get Color History by ID

`GET /api/colors/history/:id`

Header: `Authorization: Bearer <token>`

### Delete Color History by ID

`DELETE /api/colors/history/:id`

Header: `Authorization: Bearer <token>`

### Delete All Color History

`DELETE /api/colors/history/delete`

Header: `Authorization: Bearer <token>`

### Chatbot Gemini

`POST /api/colors/chat-bot`

Header: `Authorization: Bearer <token>`

| FieldName | Required | Type   | Description          |
| :-------- | :------- | :----- | :------------------- |
| message   | true     | string | Pertanyaan ke Gemini |

Response:

```json
{
  "reply": "Jawaban dari Gemini",
  "colors": ["#FFFFFF", "#000000"]
}
```

---

## Models

### User

```js
{
  name: String,
  email: String,
  password: String,
  isVerified: Boolean,
  verificationCode: String,
  verificationExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ColorHistory

```js
{
  user: ObjectId,
  colors: [
    { hex: String, rgb: String, hsl: String, name: String }
  ],
  image: String,
  detectedAt: Date
}
```

---

## Middleware

- **upload**: Menggunakan multer dan Cloudinary untuk upload gambar (maks 5MB, format jpg/png/jpeg/gif).
- **validation**: Validasi input menggunakan express-validator.
- **verifyToken**: Validasi JWT Bearer Token pada endpoint yang dilindungi.

---

## Error Handling

Semua endpoint akan mengembalikan response error dengan format:

```json
{
  "error": "error.message"
}
```

Validasi input akan mengembalikan:

```json
{
  "errors": [{ "field": "email", "message": "Format email tidak valid" }]
}
```

---

## Authorization Header

Semua endpoint yang membutuhkan autentikasi harus menyertakan header:

```
Authorization: Bearer <token>
```

---

## Deployment & Access

- Base URL: `https://api-sentra.onrender.com/`
- Semua request body menggunakan format JSON kecuali upload gambar (form-data).
- Untuk detail lebih lanjut, cek masing-masing file controller dan route.

---
