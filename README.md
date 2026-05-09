# <div align="center">🔏 SiliconSignature</div>

<div align="center">

**Hardware-Bound Image Authentication for the AI Era**

*Prove image provenance with ASIC proof-of-work and Reed-Solomon watermarking*

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff88.svg?style=for-the-badge)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Installable-00ccff.svg?style=for-the-badge)](https://silicon.p2pclaw.com)
[![Web](https://img.shields.io/badge/Web-Live-ff6b6b.svg?style=for-the-badge)](https://silicon.p2pclaw.com)

[![Go](https://img.shields.io/badge/Go-CLI-00ADD8.svg?style=flat-square&logo=go)](https://github.com/Agnuxo1/siliconsignature-go)
[![Rust](https://img.shields.io/badge/Rust-Library-000000.svg?style=flat-square&logo=rust)](https://github.com/Agnuxo1/siliconsignature-rust)
[![TypeScript](https://img.shields.io/badge/TypeScript-npm-3178C6.svg?style=flat-square&logo=typescript)](https://github.com/Agnuxo1/siliconsignature-ts)
[![Android](https://img.shields.io/badge/Android-APK-3DDC84.svg?style=flat-square&logo=android)](https://github.com/Agnuxo1/silicon-android)

</div>

---

## 🚨 The Problem

| Threat | Current Solutions | Why They Fail |
|--------|----------------|---------------|
| **Deepfakes** | Detection algorithms | Reactive — find fakes *after* creation |
| **Image forgery** | EXIF metadata | Stripped in 1 click |
| **AI watermarking** | C2PA, SynthID | Trusts corporations; removable |
| **NFT provenance** | Blockchain tokens | Just a URL, not the image |

**SiliconSignature is different.** We embed **unforgeable proof-of-work** directly into the image pixels — bound to a physical ASIC chip. No corporation to trust. No metadata to strip. No blockchain needed.

---

## ⚡ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGN AN IMAGE                              │
│                                                               │
│   1. SHA-256 hash of image bytes                              │
│   2. Search for nonce via ASIC proof-of-work                 │
│   3. Reed-Solomon ECC encodes (hash + nonce + metadata)       │
│   4. Embed in LSB of blue channel (offset 0x20)               │
│   5. Magic header "SSv1" + 5× redundancy                      │
│                                                               │
│   Result: Image looks identical. But pixels carry proof.      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   VERIFY AN IMAGE                             │
│                                                               │
│   1. Extract LSB from blue channel                            │
│   2. Decode Reed-Solomon (tolerates 40% pixel loss)           │
│   3. Validate nonce via SHA-256 check                         │
│   4. Confirm ASIC work was performed                            │
│                                                               │
│   Result: Authentic or Tampered. Binary. No grey area.       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Compared to Alternatives

| | **SiliconSignature** | **C2PA (Adobe)** | **SynthID (Google)** | **NFT** |
|---|:---:|:---:|:---:|:---:|
| **Open Source** | ✅ MIT | ❌ Corporate | ❌ Corporate | Varies |
| **No Dependencies** | ✅ Pure code | ❌ Ecosystem | ❌ API | ❌ Blockchain |
| **Survives editing** | ✅ 40% pixels | ⚠️ Metadata only | ⚠️ Compression | ❌ None |
| **Hardware-bound** | ✅ ASIC PoW | ❌ No | ❌ No | ❌ No |
| **Cost to forge** | **$10,000+** | $0 (strip metadata) | $0 (remove sig) | $0 (screenshot) |
| **Verification** | ✅ Offline | ❌ Needs Adobe | ❌ Needs Google | ❌ Needs blockchain |

---

## 🚀 Live Demo

**➡️ [https://silicon.p2pclaw.com](https://silicon.p2pclaw.com)**

Works offline. Install as PWA. Zero backend required.

---

## 📦 Quick Start

### As PWA (Recommended)

```
1. Visit silicon.p2pclaw.com
2. Click "Add to Home Screen"
3. Sign & verify images offline — forever
```

### Self-Hosted

```bash
git clone https://github.com/Agnuxo1/siliconsignature-web.git
cd siliconsignature-web
python3 -m http.server 8080
# Open http://localhost:8080
```

### API

```bash
# Sign
curl -X POST https://silicon.p2pclaw.com/api/v1/sign \
  -F "image=@photo.png" \
  -F "creator_id=Agnuxo1"

# Verify
curl -X POST https://silicon.p2pclaw.com/api/v1/verify \
  -F "image=@signed.png"
```

---

## 🏗️ Ecosystem

SiliconSignature is available in **7 languages/platforms**:

| Platform | Repository | Status |
|----------|-----------|--------|
| 🌐 **Web/PWA** | [siliconsignature-web](https://github.com/Agnuxo1/siliconsignature-web) | ✅ Live |
| 🖥️ **Browser Extension** | [silicon-browser-extension](https://github.com/Agnuxo1/silicon-browser-extension) | ✅ Chrome/Firefox |
| 🎨 **ComfyUI Node** | [silicon-comfyui-node](https://github.com/Agnuxo1/silicon-comfyui-node) | ✅ Custom node |
| 🎨 **A1111 Script** | [silicon-a1111-script](https://github.com/Agnuxo1/silicon-a1111-script) | ✅ WebUI script |
| 🐹 **Go CLI** | [siliconsignature-go](https://github.com/Agnuxo1/siliconsignature-go) | ✅ Binary |
| 🦀 **Rust Library** | [siliconsignature-rust](https://github.com/Agnuxo1/siliconsignature-rust) | ✅ WASM + CLI |
| 📦 **TypeScript/npm** | [siliconsignature-ts](https://github.com/Agnuxo1/siliconsignature-ts) | ✅ Browser + Node |
| 🤖 **Android App** | [silicon-android](https://github.com/Agnuxo1/silicon-android) | ✅ APK |

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

## 📊 Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Software sign (CPU) | ~300ms | Pure JS, single-thread |
| Software verify (CPU) | ~150ms | Extract + RS decode + hash |
| ASIC sign (BM1387) | ~2-5s | Real hardware, unforgeable |
| Tamper survival | 40% | Reed-Solomon threshold |
| Image quality impact | 0% | LSB change invisible |

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

**Ways to help:**
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest integrations (image generators, forensics tools, journalism platforms)
- 🌍 Translate the web app
- 🔬 Improve Reed-Solomon decoder performance
- 🎨 Design better UI/UX

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

<div align="center">

**Built with 🔥 by [@Agnuxo1](https://github.com/Agnuxo1) — P2PCLAW Ecosystem**

*"We don't trust. We verify."*

</div>
