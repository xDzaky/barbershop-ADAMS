# 🧪 Testing Guide

Panduan untuk testing aplikasi Barbershop Booking System.

## 🚀 Quick Start Testing

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Edit .env.local dan set:
SKIP_PAYMENT=true  # Untuk testing tanpa payment gateway
```

### 2. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 3. Seed Database

Akses: `http://localhost:3000/api/seed`

Ini akan:
- ✅ Create 6 services (Cukur Dewasa & Anak hingga Curly Perm)
- ✅ Generate slots untuk 4 hari ke depan (09:00 - 20:00)

## 📋 Testing Checklist

### ✅ Home Page Testing

**URL:** `http://localhost:3000`

#### Visual Testing
- [ ] Header image placeholder tampil dengan gradient
- [ ] Nama barbershop "Kang Cukur Adam's" tampil
- [ ] Rating 5.0 stars tampil
- [ ] Alamat lengkap tampil dengan icon
- [ ] Action buttons (Book Appointment, View on Maps) tampil
- [ ] Tab navigation (About, Services, Reviews) tampil

#### Functional Testing
- [ ] Klik "Book Appointment" → redirect ke `/booking`
- [ ] Klik "View on Maps" → open Google Maps di tab baru
- [ ] Klik tab "About" → tampil opening hours dan about us
- [ ] Klik tab "Services" → tampil list services dengan harga
- [ ] Klik tab "Reviews" → tampil customer reviews
- [ ] Klik "Admin Login" → redirect ke `/admin/login`
- [ ] Floating book button di bottom tampil
- [ ] Klik floating book button → redirect ke `/booking`

#### Data Testing
- [ ] Opening hours: Senin - Minggu, 09:00 - 21:00
- [ ] Services list tampil 6 layanan
- [ ] Harga services sesuai (Rp 20.000 - Rp 150.000)
- [ ] Reviews tampil 3 testimonials

### ✅ Booking Page Testing

**URL:** `http://localhost:3000/booking`

#### Step 1: Pilih Jadwal & Layanan

**Visual Testing:**
- [ ] Barbershop header tampil dengan icon dan nama
- [ ] Step indicator tampil (3 dots)
- [ ] Services list tampil dengan card design
- [ ] Date tabs tampil (7 hari ke depan)
- [ ] Time slots grid tampil

**Functional Testing:**
- [ ] Klik service card → card ter-select (border accent)
- [ ] Klik date tab → date ter-select (background accent)
- [ ] Klik time slot → slot ter-select (background accent)
- [ ] Klik "Lanjut" tanpa pilih → button disabled
- [ ] Klik "Lanjut" setelah pilih semua → go to step 2

**Data Testing:**
- [ ] Services tampil 6 items
- [ ] Harga dan DP tampil benar
- [ ] Durasi tampil benar
- [ ] Date tabs tampil 7 hari
- [ ] Time slots tampil sesuai jam operasional (09:00 - 20:00)
- [ ] Slots dengan interval 30 menit

#### Step 2: Data Diri

**Visual Testing:**
- [ ] Form nama tampil
- [ ] Form WhatsApp tampil
- [ ] Back button tampil

**Functional Testing:**
- [ ] Input nama < 2 karakter → error message
- [ ] Input phone invalid → error message
- [ ] Input valid → no error
- [ ] Klik "Lanjut" dengan data valid → go to step 3
- [ ] Klik "Kembali" → back to step 1

**Validation Testing:**
- [ ] Nama minimal 2 karakter
- [ ] Phone format: 08xxx atau +628xxx
- [ ] Phone 10-14 digit

#### Step 3: Konfirmasi

**Visual Testing:**
- [ ] Summary card tampil dengan gradient
- [ ] Detail booking lengkap tampil
- [ ] Total harga tampil
- [ ] Info pembayaran tampil

**Functional Testing:**
- [ ] Klik "Konfirmasi Booking" → create booking
- [ ] Loading state tampil saat submit
- [ ] Success → go to step 4
- [ ] Error → alert message

**Data Testing:**
- [ ] Layanan sesuai pilihan
- [ ] Tanggal sesuai pilihan
- [ ] Jam sesuai pilihan
- [ ] Nama sesuai input
- [ ] WhatsApp sesuai input
- [ ] Total harga sesuai service

#### Step 4: Success

**Visual Testing:**
- [ ] Success icon (🎉) tampil
- [ ] Booking code tampil dengan style prominent
- [ ] Success message tampil
- [ ] Action buttons tampil

**Functional Testing:**
- [ ] Klik "Cek Status Booking" → redirect ke `/booking/[code]`
- [ ] Klik "Kembali ke Home" → redirect ke `/`

**Data Testing:**
- [ ] Booking code format: BRB-XXXX-YYY
- [ ] Booking code unique

### ✅ Booking Status Page Testing

**URL:** `http://localhost:3000/booking/[BOOKING_CODE]`

#### Visual Testing
- [ ] Status icon tampil sesuai state
- [ ] Booking code tampil prominent
- [ ] Status badge tampil dengan warna
- [ ] Detail booking card tampil
- [ ] Payment info card tampil
- [ ] Alert banner tampil (jika ada)

#### Functional Testing
- [ ] Input booking code valid → tampil detail
- [ ] Input booking code invalid → tampil not found
- [ ] Klik "Kembali ke Home" → redirect ke `/`

#### Status States Testing
- [ ] Pending payment → icon ⏳, badge pending
- [ ] Confirmed → icon ✅, badge booking
- [ ] Checked in → icon 📍, badge booking
- [ ] In service → icon ✂️, badge open
- [ ] Done → icon 🎉, badge done
- [ ] Cancelled → icon ❌, badge cancelled
- [ ] Downgraded → icon ⚠️, badge downgraded

#### Data Testing
- [ ] Customer name tampil
- [ ] Customer phone tampil
- [ ] Service name tampil
- [ ] Date tampil dengan format Indonesia
- [ ] Time tampil (HH:MM - HH:MM)
- [ ] Price tampil dengan format Rp

### ✅ API Testing

#### GET /api/services
```bash
curl http://localhost:3000/api/services
```
- [ ] Return list of services
- [ ] Services count = 6
- [ ] Each service has: id, name, price, dp_amount, duration_min

#### GET /api/slots?date=YYYY-MM-DD
```bash
curl http://localhost:3000/api/slots?date=2026-04-25
```
- [ ] Return list of slots for date
- [ ] Only return 'open' slots
- [ ] Filter slots >= NOW + 30 minutes
- [ ] Each slot has: id, start_time, end_time, status

#### POST /api/booking/create
```bash
curl -X POST http://localhost:3000/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "xxx",
    "service_id": "xxx",
    "customer_name": "Test User",
    "customer_phone": "081234567890"
  }'
```
- [ ] Create booking successfully
- [ ] Return booking_code
- [ ] Return snap_token (if not SKIP_PAYMENT)
- [ ] Slot status changed to 'pending'
- [ ] Error if slot not available
- [ ] Error if < 30 minutes

#### GET /api/booking/status?code=BRB-XXXX-YYY
```bash
curl http://localhost:3000/api/booking/status?code=BRB-XXXX-YYY
```
- [ ] Return booking details
- [ ] Include slot info
- [ ] Include service info
- [ ] Error if code not found

### ✅ Responsive Testing

#### Mobile (375px)
- [ ] Layout tidak overflow
- [ ] Text readable
- [ ] Buttons accessible
- [ ] Images scaled properly
- [ ] Tabs scrollable horizontal

#### Tablet (768px)
- [ ] Layout centered (max-width: 480px)
- [ ] Spacing appropriate
- [ ] All features accessible

#### Desktop (1024px+)
- [ ] Layout centered (max-width: 480px)
- [ ] No layout issues
- [ ] All features accessible

### ✅ Performance Testing

- [ ] Page load < 3 seconds
- [ ] Images optimized
- [ ] No console errors
- [ ] No console warnings
- [ ] Smooth animations
- [ ] No layout shift

### ✅ Accessibility Testing

- [ ] Color contrast sufficient
- [ ] Text readable
- [ ] Buttons have clear labels
- [ ] Forms have labels
- [ ] Error messages clear
- [ ] Focus states visible

### ✅ Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🐛 Common Issues & Solutions

### Issue: Services tidak tampil
**Solution:** Jalankan seed API: `http://localhost:3000/api/seed`

### Issue: Slots tidak tampil
**Solution:** 
1. Check date yang dipilih
2. Pastikan ada slots untuk date tersebut
3. Check jam sekarang (slots hanya tampil >= NOW + 30 menit)

### Issue: Booking gagal
**Solution:**
1. Check slot masih available
2. Check validasi form (nama, phone)
3. Check console untuk error message

### Issue: Payment tidak muncul
**Solution:** Set `SKIP_PAYMENT=true` di `.env.local` untuk testing mode

## 📊 Test Data

### Sample Services
1. Cukur Dewasa & Anak - Rp 20.000
2. Cukur + Cuci - Rp 25.000
3. Cukur + Cuci + Creambath - Rp 35.000
4. Cukur + Cuci + Smoothing - Rp 100.000
5. Cukur + Cuci + Rebonding - Rp 120.000
6. Curly Perm - Rp 150.000

### Sample Customer Data
- Name: "Budi Santoso"
- Phone: "081234567890"

### Sample Booking Codes
- Format: BRB-XXXX-YYY
- Example: BRB-2904-XK7

## ✅ Testing Completion

Setelah semua checklist di atas selesai:
- [ ] All visual tests passed
- [ ] All functional tests passed
- [ ] All data tests passed
- [ ] All API tests passed
- [ ] All responsive tests passed
- [ ] All performance tests passed
- [ ] All accessibility tests passed
- [ ] All browser tests passed

## 🚀 Ready for Production

Jika semua tests passed, aplikasi siap untuk:
1. Setup production environment variables
2. Deploy to Vercel
3. Configure custom domain
4. Setup Midtrans production
5. Setup Fonnte WhatsApp
6. Setup cron jobs
7. Monitor and maintain
