# Firebase Chat Setup Guide

## 1. Setup Firebase Project

### Buat Firebase Project

1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Create a project" atau "Add project"
3. Berikan nama project (misal: "montir-app-chat")
4. Enable Google Analytics (optional)
5. Klik "Create project"

### Setup Firestore Database

1. Di Firebase Console, pilih "Firestore Database"
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih lokasi server (pilih yang terdekat dengan pengguna, misal: asia-southeast1)
5. Klik "Done"

### Get Firebase Configuration

1. Di Firebase Console, klik gear icon ⚙️ > "Project settings"
2. Scroll ke bawah, klik "Add app" dan pilih icon Web (</>)
3. Berikan nama app (misal: "montir-chat-app")
4. Copy configuration object yang diberikan

### Update Firebase Config

Edit file `src/config/firebase.ts` dan ganti dengan konfigurasi Anda:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxx",
};
```

## 2. Firestore Security Rules

Di Firebase Console > Firestore Database > Rules, update dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chat messages rules
    match /orderChats/{document} {
      // Allow read/write if user is part of the order
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.user._id.toString() ||
         request.auth.uid == get(/databases/$(database)/documents/orders/$(resource.data.orderId)).data.pelanggan_id.toString() ||
         request.auth.uid == get(/databases/$(database)/documents/orders/$(resource.data.orderId)).data.montir_id.toString());
    }

    // For development only - remove in production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 3. Firestore Collection Structure

### Collection: `orderChats`

```json
{
  "text": "Hello, bagaimana progress ordernya?",
  "createdAt": "2025-12-02T10:30:00Z",
  "user": {
    "_id": 123,
    "name": "John Doe",
    "role": "pelanggan"
  },
  "orderId": "ORD-2025-001"
}
```

## 4. Authentication (Optional)

Jika ingin menggunakan Firebase Auth:

1. Di Firebase Console, aktifkan Authentication
2. Enable provider yang diinginkan (Email/Password, Google, dll)
3. Update chat service untuk menggunakan Firebase Auth

## 5. Testing Chat

### Test Scenarios:

1. **Pelanggan kirim pesan ke montir**
2. **Montir balas pesan ke pelanggan**
3. **Real-time message updates**
4. **Chat history persistence**

### Test Data:

```javascript
// Test message pelanggan
{
  text: "Halo pak, sudah sampai belum?",
  user: { _id: 1, name: "Budi Santoso", role: "pelanggan" },
  orderId: "ORD-2025-001"
}

// Test message montir
{
  text: "Sudah dalam perjalanan pak, 5 menit lagi sampai",
  user: { _id: 2, name: "Ahmad Montir", role: "montir" },
  orderId: "ORD-2025-001"
}
```

## 6. Features Implemented

✅ **Real-time messaging** - Messages appear instantly
✅ **Chat UI** - Beautiful chat interface using react-native-gifted-chat
✅ **Order-specific chats** - Each order has separate chat room
✅ **User identification** - Shows sender name and role
✅ **Message persistence** - Chat history saved in Firestore
✅ **Cross-platform** - Works on iOS and Android

## 7. Usage

### Untuk Pelanggan:

1. Buka detail order
2. Klik tombol "💬 Chat Montir" di bagian informasi montir
3. Ketik pesan dan kirim

### Untuk Montir:

1. Buka detail order yang ditugaskan
2. Klik tombol "💬 Chat Pelanggan" di bagian informasi pelanggan
3. Ketik pesan dan kirim

## 8. Customization Options

### Chat Appearance:

- Ubah warna bubble di `OrderChat.tsx`
- Customize avatar style
- Modify timestamp format

### Additional Features:

- **Read receipts** - Track message read status
- **Typing indicators** - Show when user is typing
- **Image/File sharing** - Send images or documents
- **Push notifications** - Notify users of new messages

## 9. Performance Optimization

### Tips:

1. **Limit message history** - Query only recent messages
2. **Pagination** - Load older messages on demand
3. **Offline support** - Cache messages locally
4. **Cleanup** - Remove old chat data periodically

### Example: Limit Messages

```typescript
const q = query(
  collection(db, "orderChats"),
  where("orderId", "==", orderId),
  orderBy("createdAt", "desc"),
  limit(50) // Only load last 50 messages
);
```

## 10. Production Considerations

### Security:

- [ ] Update Firestore rules for production
- [ ] Implement proper authentication
- [ ] Validate user permissions

### Monitoring:

- [ ] Setup Firebase Analytics
- [ ] Monitor chat usage
- [ ] Track error rates

### Scaling:

- [ ] Consider Firebase Functions for complex logic
- [ ] Implement message archiving
- [ ] Add rate limiting
