# 📋 Sistem Nomor Antrian Booking

## Format: `DD-XXX`

Sistem nomor antrian menggunakan format sederhana yang mudah diingat dan dipanggil.

### Struktur:
- **DD** = Tanggal (01-31)
- **XXX** = Nomor urut dalam bulan (001-999)

---

## 🔄 Sistem Reset Bulanan

Nomor antrian akan **reset setiap awal bulan**.

### Contoh Bulan April 2026:

```
1 April 2026:
  - Booking pertama bulan ini: 01-001
  - Booking kedua bulan ini: 01-002
  - Booking ketiga bulan ini: 01-003

2 April 2026:
  - Booking keempat bulan ini: 02-004
  - Booking kelima bulan ini: 02-005

26 April 2026:
  - Booking ke-50 bulan ini: 26-050
  - Booking ke-51 bulan ini: 26-051

30 April 2026:
  - Booking ke-120 bulan ini: 30-120
```

### Contoh Bulan Mei 2026 (RESET):

```
1 Mei 2026:
  - Booking pertama bulan ini: 01-001 ← RESET ke 001
  - Booking kedua bulan ini: 01-002

2 Mei 2026:
  - Booking ketiga bulan ini: 02-003
  - Booking keempat bulan ini: 02-004
```

---

## 📱 Tampilan untuk Customer

### Halaman Booking Detail:
```
┌─────────────────────────────┐
│   ✅ BOOKING TERKONFIRMASI   │
│                             │
│      NOMOR ANTRIAN          │
│      ┌─────────┐            │
│      │ 26-050  │            │
│      └─────────┘            │
│                             │
│  Nama: Fahri_V7             │
│  Tanggal: Minggu, 26 Apr    │
│  Jam: 18:00 - 18:30         │
│  Layanan: Cukur Rambut      │
└─────────────────────────────┘
```

### WhatsApp Notification:
```
✅ Booking Berhasil!

Nomor Antrian: 26-050
Nama: Fahri_V7
Tanggal: Minggu, 26 April 2026
Jam: 18:00 - 18:30
Layanan: Cukur Rambut

Tunjukkan nomor ini saat datang ke barbershop.

Link detail booking:
https://kang-cukur-adams.vercel.app/booking/26-050
```

---

## 🏪 Cara Penggunaan di Barbershop

### Saat Customer Datang:
```
Customer: "Saya booking nomor 26-050"
Admin: *Cek di sistem tanggal 26, nomor 050*
Admin: "Baik, silakan menunggu sebentar"
```

### Saat Memanggil Antrian:
```
Admin: "Nomor 26-050, silakan!"
atau
Admin: "Nomor 50, silakan!"
```

### Saat Ramai:
```
Admin: "Nomor 26-048!"
Admin: "Nomor 26-049!"
Admin: "Nomor 26-050!"
```

---

## 🎯 Keuntungan Sistem Ini

### Untuk Customer:
✅ **Mudah diingat** - Hanya 6 karakter (26-050)
✅ **Mudah disebutkan** - "Nomor 26-050" atau "Nomor 50"
✅ **Ada info tanggal** - Langsung tahu tanggal booking
✅ **Tidak perlu login** - Cukup simpan nomor atau link

### Untuk Admin/Barber:
✅ **Cepat dicari** - Filter berdasarkan tanggal
✅ **Mudah dipanggil** - Nomor urut yang jelas
✅ **Tracking mudah** - Tahu total booking per bulan
✅ **Tidak bingung** - Tidak ada kode random panjang

### Untuk Sistem:
✅ **Unik per bulan** - Tidak ada duplikasi dalam 1 bulan
✅ **Auto reset** - Otomatis reset setiap awal bulan
✅ **Scalable** - Bisa handle 999 booking per bulan
✅ **Simple URL** - `/booking/26-050`

---

## 🔧 Implementasi Teknis

### Generate Booking Code:
```typescript
// 1. Ambil tanggal hari ini
const now = new Date()
const day = now.getDate().toString().padStart(2, '0') // "26"

// 2. Hitung total booking bulan ini
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

const { count: monthCount } = await supabase
  .from('bookings')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', monthStart.toISOString())
  .lt('created_at', monthEnd.toISOString())

// 3. Generate nomor urut
const queueNumber = ((monthCount || 0) + 1).toString().padStart(3, '0') // "050"

// 4. Gabungkan
const bookingCode = `${day}-${queueNumber}` // "26-050"
```

### Reset Logic:
- **Otomatis** setiap awal bulan
- Tidak perlu cron job
- Berdasarkan perhitungan real-time dari database

---

## 📊 Contoh Skenario Real

### Barbershop Ramai (50 booking per hari):

**Tanggal 1 April:**
- 01-001 sampai 01-050 (50 booking)

**Tanggal 2 April:**
- 02-051 sampai 02-100 (50 booking lagi)

**Tanggal 30 April:**
- 30-1451 sampai 30-1500 (booking ke-1451 sampai 1500 bulan ini)

**Tanggal 1 Mei:**
- 01-001 ← RESET, mulai dari awal lagi

---

## ⚠️ Catatan Penting

### Kapasitas:
- Maksimal **999 booking per bulan**
- Jika lebih dari 999, nomor akan jadi 4 digit (26-1000)
- Untuk barbershop normal, 999 booking/bulan sudah sangat cukup

### URL:
- Format: `/booking/26-050`
- Mudah diketik dan di-share
- Bisa di-bookmark

### Database:
- Booking code disimpan di kolom `booking_code`
- Unique per bulan (tidak ada duplikasi)
- Digunakan sebagai identifier utama

---

## 🚀 Status Implementasi

✅ **API Booking Create** - Generate nomor dengan format DD-XXX
✅ **Reset Bulanan** - Otomatis reset setiap awal bulan
✅ **Halaman Detail** - Tampilan nomor antrian yang jelas
✅ **Payment Page** - Menggunakan nomor baru
✅ **Success Animation** - Animasi sukses sebelum redirect
✅ **URL Routing** - Support format DD-XXX

---

## 📞 Support

Jika ada pertanyaan atau masalah dengan sistem nomor antrian, hubungi developer.

**Sistem ini sudah aktif dan siap digunakan!** 🎉
