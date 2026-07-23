# ARI - Automated Random Interaction / Adaptive Real-time Intercom

Aplikasi web untuk melakukan random call dengan pengguna lain secara gratis, dengan fitur video call, voice call, dan chat real-time.

## 🎯 Fitur Utama

- 📞 **Random Call**: Terhubung secara acak dengan pengguna online lain
- 🎥 **Video Call**: Panggilan video real-time menggunakan WebRTC
- 🔊 **Voice Call**: Panggilan suara saja untuk efisiensi bandwidth
- 💬 **Chat Sederhana**: Pesan teks selama panggilan berlangsung
- 🎚️ **Kontrol Media**: Mute/Unmute, On/Off Kamera, End Call
- 🌐 **Gratis & Open Source**: Tidak ada biaya tersembunyi
- 📱 **Responsive Design**: Bekerja di desktop dan mobile

## 🏗️ Arsitektur

```
ARI/
├── frontend/          # React.js + TypeScript
├── backend/           # Node.js + Express + Socket.io
├── shared/            # Shared types dan utilities
└── docs/              # Dokumentasi
```

## 🛠️ Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS (UI)
- React Query (State Management)
- Socket.io Client
- SimpleWebRTC / webrtc-adapter

### Backend
- Node.js + Express
- TypeScript
- Socket.io (Real-time Communication)
- Firebase Admin SDK (Database)
- CORS & Security Middleware

### Infrastructure
- **Database**: Firebase Realtime Database (gratis dengan quota)
- **Hosting Frontend**: Vercel (gratis)
- **Hosting Backend**: Railway / Render (gratis tier tersedia)
- **Real-time**: WebSocket via Socket.io

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm atau yarn
- Firebase Account (gratis)
- Git

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/lnear890-svg/ARI.git
cd ARI
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan Firebase credentials Anda
npm run dev
```

## 📋 Alur Aplikasi

### Proses Random Call
1. User membuka aplikasi dan membuat session
2. Tombol "Mulai Panggilan" diklik
3. Server menghubungkan ke user lain yang sedang menunggu
4. Koneksi WebRTC dibuat secara peer-to-peer
5. User dapat memilih mode (Video/Voice)
6. Selama call, user bisa chat dan kontrol media
7. Salah satu user menekan "End Call" untuk mengakhiri

## 💰 Cost Analysis

| Service | Cost | Alasan |
|---------|------|--------|
| Firebase Realtime DB | Gratis | 100 concurrent users gratis |
| Vercel (Frontend) | Gratis | 100 GB bandwidth/bulan |
| Railway/Render | Gratis | ~$5 kredit/bulan |
| Domain | Opsional | namecheap.com dari $1 |
| **Total** | **Gratis** | Dapat scalable dengan cost |

## 📄 License

MIT License - Bebas untuk digunakan secara komersial

---

**Built with ❤️ for random connections**
