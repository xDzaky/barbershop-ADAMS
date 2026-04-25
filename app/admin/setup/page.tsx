'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ServiceInput {
  name: string
  price: string
}

export default function AdminSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('20:00')
  const [slotDuration, setSlotDuration] = useState('30')

  // Step 3
  const [services, setServices] = useState<ServiceInput[]>([
    { name: 'Potong Rambut', price: '35000' },
  ])

  const addService = () => {
    setServices([...services, { name: '', price: '' }])
  }

  const updateService = (idx: number, field: keyof ServiceInput, value: string) => {
    const updated = [...services]
    updated[idx] = { ...updated[idx], [field]: value }
    setServices(updated)
  }

  const removeService = (idx: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== idx))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }

    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        shop_name: shopName,
        owner_name: ownerName,
        phone,
        open_time: openTime,
        close_time: closeTime,
        slot_duration: parseInt(slotDuration),
        services: services
          .filter((s) => s.name && s.price)
          .map((s) => ({
            name: s.name,
            price: parseInt(s.price),
            dp_amount: parseInt(s.price), // dp = price (bayar penuh, tidak ada DP)
          })),
      }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      alert('Gagal menyimpan data. Silakan coba lagi.')
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏪</div>
        <h1 className="page-title">Setup Barbershop</h1>
        <p className="page-subtitle">Isi data toko untuk memulai</p>
      </div>

      <div className="steps">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in">
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>📋 Info Toko</h3>
          <div className="form-group">
            <label className="form-label">Nama Barbershop</label>
            <input className="form-input" placeholder="Barbershop Jaya" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Pemilik</label>
            <input className="form-input" placeholder="Nama Anda" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nomor HP Toko</label>
            <input className="form-input" placeholder="08123456789" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setStep(2)} disabled={!shopName || !ownerName}>
            Lanjut →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>🕐 Jam Operasional</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Jam Buka</label>
              <input className="form-input" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Tutup</label>
              <input className="form-input" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Durasi per Slot (menit)</label>
            <select className="form-input" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="45">45 menit</option>
              <option value="60">60 menit</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Kembali</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Lanjut →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>✂️ Layanan</h3>
          {services.map((svc, i) => (
            <div key={i} className="card" style={{ marginBottom: '10px', position: 'relative' }}>
              {services.length > 1 && (
                <button onClick={() => removeService(i)} style={{ position: 'absolute', top: '8px', right: '10px', background: 'none', color: 'var(--danger)', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>×</button>
              )}
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label">Nama Layanan</label>
                <input className="form-input" placeholder="Potong Rambut" value={svc.name} onChange={(e) => updateService(i, 'name', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga (Rp)</label>
                <input className="form-input" type="number" placeholder="35000" value={svc.price} onChange={(e) => updateService(i, 'price', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="btn btn-outline btn-block btn-sm" onClick={addService} style={{ marginBottom: '16px' }}>
            + Tambah Layanan
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Kembali</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : '🚀 Simpan & Mulai'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
