# 📱 Responsive Design Guide

## Prioritas Design

### 1. **Mobile First** (Prioritas Utama)
- Optimized untuk layar 320px - 480px
- Touch-friendly buttons (min 44px)
- Single column layout
- Bottom navigation untuk akses mudah

### 2. **Tablet** (Secondary)
- Layar 768px - 1023px
- Tetap menggunakan mobile layout
- Centered dengan shadow untuk visual yang lebih baik

### 3. **Desktop/Laptop** (Tertiary)
- Layar 1024px ke atas
- Mobile layout di-center dengan max-width 480px
- Shadow dan background untuk membedakan dari desktop
- Border radius untuk tampilan card-like

---

## 🎨 Tampilan di Berbagai Device

### **Mobile (320px - 767px)**
```
┌─────────────────────┐
│                     │
│   FULL WIDTH        │
│   CONTENT           │
│                     │
│                     │
│                     │
│                     │
└─────────────────────┘
```
- Full width tanpa margin
- No shadow
- Bottom nav fixed di bawah

### **Tablet (768px - 1023px)**
```
┌───────────────────────────────┐
│  ┌─────────────────────┐      │
│  │                     │      │
│  │   CENTERED          │      │
│  │   MAX 480px         │      │
│  │   WITH SHADOW       │      │
│  │                     │      │
│  └─────────────────────┘      │
└───────────────────────────────┘
```
- Centered dengan max-width 480px
- Shadow untuk depth
- Margin 10px atas bawah

### **Desktop (1024px+)**
```
┌─────────────────────────────────────┐
│                                     │
│    ┌─────────────────────┐          │
│    │                     │          │
│    │   CENTERED          │          │
│    │   MAX 480px         │          │
│    │   CARD STYLE        │          │
│    │   BORDER RADIUS     │          │
│    │                     │          │
│    └─────────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```
- Centered dengan max-width 480px
- Shadow yang lebih prominent
- Border radius 16px
- Margin 20px atas bawah
- Background abu-abu untuk kontras

---

## 📐 Breakpoints

```css
/* Mobile (Default) */
/* 320px - 767px */
/* No media query needed */

/* Tablet */
@media (min-width: 768px) {
  /* Centered layout dengan shadow */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Card-style dengan border radius */
}
```

---

## 🎯 Komponen Responsive

### **1. Container**
```css
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 1024px) {
  .container {
    margin-top: 20px;
    margin-bottom: 20px;
    border-radius: 16px;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
  }
}
```

### **2. Bottom Navigation**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .bottom-nav {
    border-radius: 0 0 16px 16px;
  }
}
```

### **3. Payment Container**
```css
.payment-container {
  max-width: 480px;
  margin: 0 auto;
  background: #3D3B6B;
}

@media (min-width: 1024px) {
  .payment-container {
    margin-top: 20px;
    margin-bottom: 20px;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
  }
}
```

### **4. Modal (Success & QRIS)**
```css
.success-modal,
.qris-modal {
  max-width: 440px;
  width: 100%;
}

@media (min-width: 768px) {
  .success-modal {
    max-width: 400px;
  }
  
  .qris-modal {
    max-width: 420px;
  }
}
```

---

## ✅ Fitur Responsive

### **Mobile (Prioritas)**
✅ Touch-friendly buttons (min 44x44px)
✅ Single column layout
✅ Bottom navigation fixed
✅ Full width content
✅ Optimized untuk one-hand use
✅ Swipe-friendly calendar
✅ Large tap targets

### **Tablet**
✅ Centered layout (480px max)
✅ Shadow untuk depth
✅ Margin untuk breathing room
✅ Tetap menggunakan mobile UI

### **Desktop**
✅ Card-style appearance
✅ Border radius untuk polish
✅ Prominent shadow
✅ Background kontras
✅ Centered dengan max-width
✅ Hover states untuk interactivity

---

## 🎨 Visual Hierarchy

### **Mobile**
```
Priority 1: Content (full width)
Priority 2: Navigation (bottom fixed)
Priority 3: Actions (prominent buttons)
```

### **Desktop**
```
Priority 1: Content (centered card)
Priority 2: Visual separation (shadow & background)
Priority 3: Navigation (bottom of card)
```

---

## 📱 Testing Checklist

### **Mobile (320px - 767px)**
- [ ] Content tidak terpotong
- [ ] Button mudah di-tap
- [ ] Text readable tanpa zoom
- [ ] Bottom nav tidak menutupi content
- [ ] Scroll smooth
- [ ] No horizontal scroll

### **Tablet (768px - 1023px)**
- [ ] Content centered
- [ ] Shadow terlihat
- [ ] Margin atas/bawah ada
- [ ] Bottom nav di dalam container
- [ ] No horizontal scroll

### **Desktop (1024px+)**
- [ ] Content centered dengan max 480px
- [ ] Border radius terlihat
- [ ] Shadow prominent
- [ ] Background abu-abu terlihat
- [ ] Hover states berfungsi
- [ ] No horizontal scroll

---

## 🔧 Troubleshooting

### **Horizontal Scroll Muncul**
```css
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### **Content Terlalu Lebar**
```css
* {
  max-width: 100%;
}
```

### **Image Overflow**
```css
img {
  max-width: 100%;
  height: auto;
}
```

### **Bottom Nav Tidak Centered di Desktop**
```css
.bottom-nav {
  left: 50%;
  transform: translateX(-50%);
  max-width: 480px;
}
```

---

## 🎯 Best Practices

### **DO ✅**
- Prioritaskan mobile experience
- Test di device real, bukan hanya browser
- Gunakan relative units (rem, em, %)
- Maintain consistent spacing
- Keep tap targets min 44x44px
- Use max-width untuk prevent stretch

### **DON'T ❌**
- Jangan ubah layout drastis di desktop
- Jangan gunakan fixed width (px) untuk container
- Jangan lupa test di landscape mode
- Jangan buat button terlalu kecil
- Jangan lupakan hover states di desktop

---

## 📊 Device Statistics

### **Target Devices**
```
Mobile:  70% (Primary)
Tablet:  20% (Secondary)
Desktop: 10% (Tertiary)
```

### **Common Resolutions**
```
Mobile:
- 375x667 (iPhone SE, 6, 7, 8)
- 390x844 (iPhone 12, 13, 14)
- 360x640 (Android)

Tablet:
- 768x1024 (iPad)
- 820x1180 (iPad Air)

Desktop:
- 1920x1080 (Full HD)
- 1366x768 (Laptop)
```

---

## 🚀 Implementation Status

✅ **Mobile Layout** - Optimized dan tested
✅ **Tablet Layout** - Centered dengan shadow
✅ **Desktop Layout** - Card-style dengan border radius
✅ **Bottom Navigation** - Responsive di semua device
✅ **Modals** - Responsive dengan max-width
✅ **Payment Page** - Responsive dengan proper styling
✅ **Home Page** - Responsive dengan centered layout
✅ **Booking Page** - Responsive dengan calendar yang baik

---

## 📞 Support

Jika ada masalah dengan responsive design di device tertentu, laporkan dengan:
- Device name & model
- Screen resolution
- Browser & version
- Screenshot masalah

**Design sudah responsive dan siap untuk semua device!** 🎉
