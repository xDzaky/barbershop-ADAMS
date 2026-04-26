# 💳 Payment Gateway Testing Guide

Panduan untuk testing Midtrans Payment Gateway dalam mode Sandbox.

## 🔧 Konfigurasi

### Environment Variables

File `.env.local` sudah dikonfigurasi untuk Sandbox mode:

```env
# Testing Mode - Set to false to enable Midtrans
SKIP_PAYMENT=false

# Midtrans Sandbox
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-U_AWSeFwGt56_AO5
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-L63dP8VFYCyMUDv77seHxCjA
MIDTRANS_CLIENT_KEY=SB-Mid-client-U_AWSeFwGt56_AO5
MIDTRANS_IS_PRODUCTION=false
```

### Mode Testing

Ada 2 mode testing:

1. **SKIP_PAYMENT=true** - Bypass payment gateway (langsung confirmed)
2. **SKIP_PAYMENT=false** - Menggunakan Midtrans Sandbox

## 🧪 Testing Flow

### 1. Persiapan

```bash
# Restart development server setelah update .env.local
npm run dev
```

### 2. Buat Booking

1. Buka `http://localhost:3000`
2. Klik "Booking" atau "Book Appointment"
3. Pilih service, date, dan time slot
4. Isi data customer:
   - Nama: Test User
   - Phone: 081234567890
5. Klik "Konfirmasi Booking"

### 3. Payment Popup (Midtrans Snap)

Setelah konfirmasi, akan muncul popup Midtrans Snap dengan opsi pembayaran.

### 4. Testing Payment Methods

#### A. Credit Card (Sandbox)

**Test Card Numbers:**

| Card Type | Number | CVV | Exp Date | 3DS |
|-----------|--------|-----|----------|-----|
| Success | 4811 1111 1111 1114 | 123 | 01/25 | 112233 |
| Failure | 4911 1111 1111 1113 | 123 | 01/25 | 112233 |
| Challenge | 4411 1111 1111 1118 | 123 | 01/25 | 112233 |

**Steps:**
1. Pilih "Credit/Debit Card"
2. Masukkan card number
3. Masukkan CVV dan expiry date
4. Klik "Pay"
5. Masukkan OTP: 112233
6. Payment success!

#### B. GoPay (Sandbox)

**Steps:**
1. Pilih "GoPay"
2. Akan muncul QR code
3. Di sandbox, klik "Simulate Payment"
4. Pilih "Success"
5. Payment success!

#### C. Bank Transfer (Sandbox)

**Steps:**
1. Pilih "Bank Transfer" (BCA/BNI/Mandiri/Permata)
2. Akan muncul virtual account number
3. Di sandbox, klik "Simulate Payment"
4. Pilih "Success"
5. Payment success!

#### D. E-Wallet (Sandbox)

**ShopeePay/QRIS:**
1. Pilih payment method
2. Akan muncul QR code
3. Klik "Simulate Payment"
4. Pilih "Success"

## 📊 Status Flow

### Payment Success
```
pending_payment → confirmed → checked_in → in_service → done
```

### Payment Failed/Expired
```
pending_payment → cancelled
```

### Slot Status
```
open → pending (5 min) → booked (after payment)
```

## 🔍 Monitoring

### 1. Check Booking Status

```bash
# Via API
curl http://localhost:3000/api/booking/status?code=BRB-XXXX-YYY
```

### 2. Check Database

```sql
-- Check bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Check slots
SELECT * FROM slots WHERE status != 'open' ORDER BY date, start_time;
```

### 3. Check Logs

```bash
# Terminal output akan menampilkan:
# - Midtrans transaction creation
# - Webhook notifications
# - Payment status updates
```

## 🎯 Test Scenarios

### Scenario 1: Successful Payment
1. Create booking
2. Pay with test card (4811 1111 1111 1114)
3. Complete 3DS (OTP: 112233)
4. ✅ Booking status: confirmed
5. ✅ Slot status: booked

### Scenario 2: Failed Payment
1. Create booking
2. Pay with failure card (4911 1111 1111 1113)
3. ❌ Payment failed
4. ✅ Booking status: cancelled
5. ✅ Slot status: open (released)

### Scenario 3: Payment Timeout
1. Create booking
2. Don't complete payment (wait 5 minutes)
3. ✅ Slot lock expires
4. ✅ Slot status: open (auto-released by cron)

### Scenario 4: Abandoned Payment
1. Create booking
2. Close payment popup without paying
3. ✅ Slot remains pending (5 min)
4. ✅ After 5 min: slot auto-released

## 🔄 Webhook Testing

### Local Testing dengan ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy ngrok URL (e.g., https://xxxx.ngrok.io)
# Set di Midtrans Dashboard:
# Settings → Configuration → Payment Notification URL
# https://xxxx.ngrok.io/api/webhook/midtrans
```

### Webhook Endpoint

```
POST /api/webhook/midtrans
```

**Payload Example:**
```json
{
  "transaction_status": "settlement",
  "order_id": "uuid-booking-id",
  "gross_amount": "10000",
  "signature_key": "hash..."
}
```

## 🐛 Troubleshooting

### Issue: Payment popup tidak muncul

**Solution:**
1. Check browser console untuk error
2. Pastikan Midtrans Snap script loaded
3. Check `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di .env.local
4. Restart dev server

### Issue: Payment success tapi booking masih pending

**Solution:**
1. Check webhook endpoint accessible
2. Check signature verification
3. Check database logs
4. Manual update via API:
```bash
curl -X POST http://localhost:3000/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{"transaction_status":"settlement","order_id":"booking-id"}'
```

### Issue: Slot tidak ter-release setelah payment gagal

**Solution:**
1. Check cron job running
2. Manual release via SQL:
```sql
UPDATE slots 
SET status = 'open', pending_until = NULL 
WHERE status = 'pending' AND pending_until < NOW();
```

## 📝 Testing Checklist

- [ ] SKIP_PAYMENT=false di .env.local
- [ ] Dev server restarted
- [ ] Midtrans Snap script loaded
- [ ] Create booking berhasil
- [ ] Payment popup muncul
- [ ] Test card payment success
- [ ] Booking status updated ke confirmed
- [ ] Slot status updated ke booked
- [ ] Test payment failure
- [ ] Booking cancelled on failure
- [ ] Slot released on failure
- [ ] Test payment timeout
- [ ] Slot auto-released after 5 min
- [ ] Webhook signature verified
- [ ] Database updates correct

## 🚀 Production Checklist

Sebelum deploy ke production:

- [ ] Update Midtrans keys ke Production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true`
- [ ] Update webhook URL di Midtrans Dashboard
- [ ] Test dengan real payment methods
- [ ] Monitor webhook logs
- [ ] Setup error alerting
- [ ] Backup database before go-live

## 📚 Resources

- [Midtrans Sandbox](https://simulator.sandbox.midtrans.com/)
- [Midtrans Docs](https://docs.midtrans.com/)
- [Test Cards](https://docs.midtrans.com/en/technical-reference/sandbox-test)
- [Webhook Guide](https://docs.midtrans.com/en/after-payment/http-notification)

## 💡 Tips

1. **Selalu test di Sandbox dulu** sebelum production
2. **Gunakan test cards** yang disediakan Midtrans
3. **Monitor webhook logs** untuk debugging
4. **Set timeout** untuk slot lock (5 menit)
5. **Implement retry logic** untuk webhook failures
6. **Log semua transactions** untuk audit trail
7. **Test edge cases** (timeout, failure, abandoned)
8. **Verify signature** di webhook untuk security
