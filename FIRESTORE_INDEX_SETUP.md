# Firestore Index Setup (Optional for Better Performance)

## Current Implementation

Saat ini chat menggunakan **client-side sorting** untuk menghindari error composite index. Ini berfungsi dengan baik untuk chat dengan jumlah pesan tidak terlalu banyak.

## Performance Optimization (Optional)

Jika ingin performance yang lebih baik, Anda bisa setup Firestore composite index.

### 1. Buka Firebase Console

Kunjungi link yang diberikan di error:

```
https://console.firebase.google.com/v1/r/project/montir-app-chat/firestore/indexes?create_composite=ClJwcm9qZWN0cy9tb250aXItYXBwLWNoYXQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL29yZGVyQ2hhdHMvaW5kZXhlcy9fEAEaCwoHb3JkZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

### 2. Create Composite Index

Firebase akan otomatis setup index untuk query:

- Collection: `orderChats`
- Fields:
  - `orderId` (Ascending)
  - `createdAt` (Descending)

### 3. Update Chat Service (After Index Created)

Setelah index selesai dibuat (biasanya beberapa menit), Anda bisa update `chat.service.ts`:

```typescript
// Ganti query di subscribeToMessages dengan:
const q = query(
  collection(db, this.messagesCollection),
  where("orderId", "==", orderId),
  orderBy("createdAt", "desc") // Server-side sorting
);

// Hapus client-side sorting:
// messages.sort((a, b) => { ... });
```

## Current vs Optimized Performance

### Current (Client-side sorting):

- ✅ No index required
- ✅ Works immediately
- ✅ Good for small chat rooms (< 100 messages)
- ⚠️ All messages downloaded then sorted
- ⚠️ Slower for large chat histories

### Optimized (Server-side sorting):

- ✅ Faster queries
- ✅ Only downloads needed messages
- ✅ Better for large chat rooms
- ⚠️ Requires composite index setup
- ⚠️ 1-5 minute setup time

## Recommendation

Untuk development dan testing, implementasi saat ini sudah cukup baik. Jika aplikasi sudah production dan chat sangat aktif, barulah setup composite index untuk performance yang optimal.
