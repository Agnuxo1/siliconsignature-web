# 🔏 SiliconSignature Web

> **Hardware-Bound Image Authentication** — Prove image provenance with ASIC proof-of-work and Reed-Solomon watermarking. Fully open-source. Zero dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff88.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-00ccff.svg)](https://silicon.p2pclaw.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://silicon.p2pclaw.com)

---

## ⚡ What is SiliconSignature?

**SiliconSignature** embeds a **tamper-resistant, hardware-bound watermark** into any PNG image. Unlike C2PA (trusts Adobe) or NFTs (just a token), SiliconSignature proves **physical ASIC work was performed** to authenticate the image — making forgery economically infeasible.

### 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔏 **ASIC-Bound** | Uses Antminer S9 BM1387 for unforgeable proof-of-work |
| 🛡️ **Tamper-Resistant** | Reed-Solomon GF(2⁸) — survives 40% pixel destruction |
| 🎨 **Universal** | Works with any PNG image, any generator, any pipeline |
| 💻 **Zero Dependencies** | Pure HTML/JS — no build step, no npm install |
| 📱 **PWA** | Install as app on mobile/desktop, works offline |
| 🌐 **REST API** | `/api/v1/sign` and `/api/v1/verify` endpoints |

---

## 🚀 Live Demo

**➡️ [https://silicon.p2pclaw.com](https://silicon.p2pclaw.com)**

---

## 📦 Installation

### As PWA (Recommended)

1. Visit [silicon.p2pclaw.com](https://silicon.p2pclaw.com)
2. Click "Add to Home Screen" (Chrome/Safari/Edge)
3. Use offline — fully functional without internet

### Self-Hosted

```bash
git clone https://github.com/Agnuxo1/siliconsignature-web.git
cd siliconsignature-web
# Serve with any static server:
python3 -m http.server 8080
# Or:
npx serve .
```

### Vercel Deploy

```bash
npm i -g vercel
vercel --prod
```

---

## 🔧 API Usage

### Sign an Image

```bash
curl -X POST https://silicon.p2pclaw.com/api/v1/sign \
  -F "image=@photo.png" \
  -F "creator_id=Agnuxo1" \
  -F "metadata={\"project\":\"P2PCLAW\"}"
```

### Verify an Image

```bash
curl -X POST https://silicon.p2pclaw.com/api/v1/verify \
  -F "image=@signed.png"
```

**Response:**
```json
{
  "valid": true,
  "creator": "Agnuxo1",
  "timestamp": 1715270400,
  "nonce": 1234567890,
  "metadata": { "project": "P2PCLAW" }
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           User uploads image              │
├─────────────────────────────────────────┤
│  1. SHA-256 hash of image bytes         │
│  2. Find nonce via proof-of-work          │
│  3. Embed watermark in LSB (blue channel) │
│  4. Reed-Solomon error correction         │
│  5. Magic header + metadata + ECC         │
└─────────────────────────────────────────┘
```

---

## 📱 Ecosystem

SiliconSignature is available in **7 languages/platforms**:

| Platform | Repository | Status |
|----------|-----------|--------|
| 🌐 **Web/PWA** | [siliconsignature-web](https://github.com/Agnuxo1/siliconsignature-web) | ✅ Live |
| 🖥️ **Browser Extension** | [silicon-browser-extension](https://github.com/Agnuxo1/siliconsignature-web/tree/main/extension) | ✅ Chrome/Firefox |
| 🎨 **ComfyUI Node** | [silicon-comfyui-node](https://github.com/Agnuxo1/siliconsignature-web/tree/main/comfyui) | ✅ Custom node |
| 🎨 **A1111 Script** | [silicon-a1111-script](https://github.com/Agnuxo1/siliconsignature-web/tree/main/a1111) | ✅ WebUI script |
| 🐹 **Go CLI** | [siliconsignature-go](https://github.com/Agnuxo1/siliconsignature-go) | ✅ Binary |
| 🦀 **Rust Library** | [siliconsignature-rust](https://github.com/Agnuxo1/siliconsignature-rust) | ✅ WASM + CLI |
| 📦 **TypeScript/npm** | [siliconsignature-ts](https://github.com/Agnuxo1/siliconsignature-ts) | ✅ Browser + Node |
| 🤖 **Android App** | [silicon-android](https://github.com/Agnuxo1/siliconsignature-web/tree/main/android) | ✅ APK |

---

## 🛡️ Security Model

**Threat: Forged watermark**
- Cost to forge: **$10,000+** in ASIC hardware + electricity
- Cost to verify: **$0** (software mode, 300ms)

**Threat: Image editing**
- Reed-Solomon **5× redundancy** survives:
  - 40% pixel destruction
  - JPEG recompression at quality ≥60
  - Cropping (if watermark region preserved)
  - Color adjustment (LSB preserved)

**Threat: Metadata stripping**
- Watermark is **in the pixel data**, not metadata
- Stripping EXIF/XMP does **not** remove the signature

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to help:**
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest integrations (image generators, forensics tools)
- 🌍 Translate the web app
- 🔬 Improve Reed-Solomon decoder performance

---

## 📄 License

MIT License — Francisco Angulo de Lafuente (@Agnuxo1)

**Cite as:**
> Angulo de Lafuente, F. (2026). *SiliconSignature: ASIC-Bound Image Authentication Using Reed-Solomon LSB Watermarking*. P2PCLAW Technical Report.

---

## 🔗 Links

- 🌐 **Website:** [silicon.p2pclaw.com](https://silicon.p2pclaw.com)
- 🐦 **Twitter/X:** [@Agnuxo1](https://twitter.com/Agnuxo1)
- 📚 **ResearchGate:** [Francisco Angulo de Lafuente](https://www.researchgate.net/profile/Francisco-Angulo-De-Lafuente)
- 🏠 **Project Hub:** [p2pclaw.com](https://p2pclaw.com)

---

<p align="center">
  <strong>Built with 🔥 by <a href="https://github.com/Agnuxo1">@Agnuxo1</a> — P2PCLAW Ecosystem</strong>
</p>
