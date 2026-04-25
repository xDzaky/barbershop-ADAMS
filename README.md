# 💈 Kang Cukur Adam's - Barbershop Booking System

Sistem booking online untuk barbershop dengan prioritas antrian dan pembayaran terintegrasi.

## 🏪 Informasi Barbershop

**Nama:** Kang Cukur Adam's  
**Alamat:** Pasar Jl. Taman Kenanga No.89, Sumber Taman, Kec. Wonoasih, Kota Probolinggo, Jawa Timur 67238  
**Maps:** [Lihat di Google Maps](https://www.google.com/maps/place/KANG+CUKUR+ADAM'S/@-7.7795283,113.229954,713m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2dd7ad1a21d43c27:0xd8f20d6630565edc!8m2!3d-7.7795283!4d113.229954!16s%2Fg%2F11cn7ckx9w?entry=ttu&g_ep=EgoyMDI2MDQyMS4wIKXMDSoASAFQAw%3D%3D)

## ⏰ Jam Operasional

- Senin - Minggu: 09:00 - 21:00

## ✂️ Layanan

1. **Cukur Dewasa & Anak** - Rp 20.000 (30 menit)
2. **Cukur + Cuci** - Rp 25.000 (45 menit)
3. **Cukur + Cuci + Creambath** - Rp 35.000 (60 menit)
4. **Cukur + Cuci + Smoothing** - Rp 100.000 (90 menit)
5. **Cukur + Cuci + Rebonding** - Rp 120.000 (120 menit)
6. **Curly Perm** - Rp 150.000 (120 menit)

## 🚀 Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Payment:** Midtrans
- **Notifications:** Fonnte (WhatsApp)
- **Deployment:** Vercel

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd barbershop-booking

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials Anda

# Run development server
npm run dev
```

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# Fonnte
FONNTE_TOKEN=your_fonnte_token

# Testing Mode (skip payment)
SKIP_PAYMENT=true
```

## 🗄️ Database Setup

1. Jalankan migration di Supabase:
```bash
# Jalankan file SQL di supabase/migrations/001_initial_schema.sql
```

2. Seed data (testing mode):
```bash
# Akses: http://localhost:3000/api/seed
```

## 📱 Features

### Customer Features
- ✅ Browse barbershop info, services, and reviews
- ✅ Book appointment online
- ✅ Choose date, time, and service
- ✅ Integrated payment (Midtrans)
- ✅ Check booking status
- ✅ WhatsApp notifications

### Admin Features
- ✅ Dashboard with statistics
- ✅ Manage time slots
- ✅ View real-time queue
- ✅ Update booking status
- ✅ View booking history

## 🎨 Design Implementation

Design telah diimplementasikan berdasarkan file PDF di folder `/docs`:
- ✅ Home page dengan info barbershop
- ✅ About section dengan opening hours
- ✅ Services list dengan harga
- ✅ Reviews section
- ✅ Booking flow dengan step-by-step
- ✅ Booking status page

## 📄 License

MIT License
