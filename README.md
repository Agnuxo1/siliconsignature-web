# 🔐 SiliconSignature — ASIC Hardware-Bound Image Authentication

> **Proof-of-Work meets Image Provenance.**
> The only image authentication system that binds a physical ASIC (Antminer S9) to every pixel.

[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)
[![P2PCLAW](https://img.shields.io/badge/Powered%20by-P2PCLAW-ff6b6b)](https://www.p2pclaw.com)
[![ASIC](https://img.shields.io/badge/ASIC-Antminer%20S9%20BM1387-orange)](https://en.wikipedia.org/wiki/Antminer)

---

## 🌐 Live Demo

| Platform | Status | URL |
|----------|--------|-----|
| **GitHub Pages** | ✅ LIVE | [agnuxo1.github.io/siliconsignature-web](https://agnuxo1.github.io/siliconsignature-web/) |
| **PWA** | ✅ LIVE | [silicon.p2pclaw.com](https://silicon.p2pclaw.com) |

---

## 📦 Ecosystem — 8 Languages/Platforms

| Platform | Repo | Status |
|----------|------|--------|
| **Web (PWA)** | [siliconsignature-web](https://github.com/Agnuxo1/siliconsignature-web) | ✅ LIVE |
| **Browser Extension** | [silicon-browser-extension](https://github.com/Agnuxo1/silicon-browser-extension) | ✅ LIVE |
| **Go CLI/Serverless** | [siliconsignature-go](https://github.com/Agnuxo1/siliconsignature-go) | ✅ LIVE |
| **Rust Library/WASM** | [siliconsignature-rust](https://github.com/Agnuxo1/siliconsignature-rust) | ✅ LIVE |
| **TypeScript/npm** | [siliconsignature-ts](https://github.com/Agnuxo1/siliconsignature-ts) | ✅ LIVE |
| **Android App** | [silicon-android](https://github.com/Agnuxo1/silicon-android) | ✅ LIVE |
| **ComfyUI Node** | [silicon-comfyui-node](https://github.com/Agnuxo1/silicon-comfyui-node) | ✅ LIVE |
| **A1111 Script** | [silicon-a1111-script](https://github.com/Agnuxo1/silicon-a1111-script) | ✅ LIVE |

---

## 🚀 Quick Start

### Web App (No Install)
1. Open [silicon.p2pclaw.com](https://silicon.p2pclaw.com)
2. Upload image → Get ASIC-bound signature
3. Share with anyone — verification is instant

### Browser Extension
```bash
git clone https://github.com/Agnuxo1/silicon-browser-extension.git
cd silicon-browser-extension
# Load unpacked in Chrome/Firefox
```

### npm Package
```bash
npm install siliconsignature
```

### Go
```bash
go install github.com/Agnuxo1/siliconsignature-go@latest
```

### Rust
```bash
cargo install siliconsignature
```

---

## 🔬 How It Works

```
Image → SHA-256 Hash → ASIC PoW (BM1387) → Reed-Solomon(255,223) → LSB Watermark
         ↑                                                            ↓
         └──────────── Verify: Extract LSB → Decode RS → Verify PoW ──┘
```

| Feature | SiliconSignature | C2PA | SynthID | NFT |
|---------|----------------|------|---------|-----|
| **Hardware Proof** | ✅ ASIC | ❌ Trust Adobe | ❌ Cloud-only | ❌ Just a token |
| **Survives 40% Edit** | ✅ Reed-Solomon | ❌ Fragile | ⚠️ Partial | ❌ No |
| **Open Source** | ✅ Full | ⚠️ Partial | ❌ No | Varies |
| **Cost to Attack** | **$200** (used S9) | **$10,000+** | **Unknown** | **Gas fees** |

---

## 📚 Documentation

- [Full Paper](https://arxiv.org/abs/2604.19792)
- [API Docs](https://api.silicon.p2pclaw.com/docs)
- [Integration Guide](https://docs.p2pclaw.com/silicon)

---

## 🏆 Awards

- 🥇 NVIDIA LlamaIndex Developers 2024
- 🌍 WIPO Global Awards 2026 (submitted)

---

## 👤 Author

**Francisco Angulo de Lafuente** (Agnuxo1)
- ORCID: [0009-0001-1634-7063](https://orcid.org/0009-0001-1634-7063)

---

**Built with 🔥 by the P2PCLAW Collective**
