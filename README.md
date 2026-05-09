# SiliconSignature PWA

A professional Progressive Web App for cryptographically signing and verifying images using Reed-Solomon protected LSB steganography. All processing happens client-side with zero external dependencies.

## Features

- **Cryptographic Signing** - Embed tamper-evident digital signatures into image pixels
- **SHA-256 Proof of Work** - CPU-based nonce searching simulates ASIC authentication
- **Reed-Solomon Error Correction** - Full GF(2^8) implementation with 32 parity symbols
- **5x Repetition Redundancy** - Watermark survives compression and basic editing
- **Visual Heatmap** - Toggle overlay showing exactly which pixels contain watermark data
- **Offline-First** - Works completely offline after first load (Service Worker)
- **Installable PWA** - Add to home screen on mobile/desktop
- **History Tracking** - Local storage of all signing and verification operations
- **Zero Dependencies** - No CDN, no npm, no external libraries

## Technical Stack

| Component | Technology |
|-----------|------------|
| Reed-Solomon | Pure JS over GF(2^8), primitive poly 0x11d |
| SHA-256 | Pure JS implementation + Web Crypto API |
| Steganography | LSB in RGB channels with voting |
| UI | Vanilla HTML/CSS/JS, Canvas API |
| Offline | Service Worker with cache-first strategy |

## Quick Start

Open `index.html` in any modern browser. No build step or server required.

### Signing an Image

1. Drag and drop an image (or click to browse)
2. Enter an optional Creator ID
3. Click **Sign Image**
4. Wait for the nonce search to complete (progress bar shows hash rate)
5. Download the signed PNG

### Verifying an Image

1. Drag and drop a signed image
2. Click **Verify Image**
3. View the verification result (Authentic / Tampered / Not Signed)
4. Expand Signature Details to see the full payload

## File Structure

```
web-pwa/
  index.html          # Single-page application
  manifest.json       # PWA manifest
  sw.js               # Service worker for offline
  css/
    style.css         # Complete professional stylesheet
  js/
    reedsolomon.js    # Full RS codec (Berlekamp-Massey, Chien, Forney)
    crypto.js         # SHA-256 + PoW nonce search
    watermark.js      # LSB embed/extract with 5x voting
    app.js            # Main application logic
```

## Algorithm Pipeline

### Embedding
```
JSON payload -> UTF-8 bytes -> RS encode(nsym=32) -> 4-byte length header -> 5x repeat -> bit stream -> LSB embed in RGB
```

### Extracting
```
LSB extract RGB -> split by 5 repetitions -> RS decode each -> JSON parse -> return first valid
```

## Signature Payload Format

```json
{
  "hash": "65501a37b306f5ac183848bab643350219c18111bfa97c706856b668d3bd5996",
  "nonce": "f16823b5",
  "ntime": "6964c85e",
  "version": "20000000",
  "status": "AUTHENTICATED_BY_BM1387",
  "creator_id": "optional_creator",
  "timestamp": 1715432000
}
```

## Screenshots

### Main Interface
Dark-themed UI with drag-and-drop zone, amber accent colors, and clean typography. The hero section displays the project branding with a brief description of the cryptographic signing capabilities.

### Signing in Progress
A progress panel shows the nonce search with attempts counter, hash rate, and elapsed time. The progress bar fills as the PoW algorithm searches for a valid nonce.

### Verification Result
Result panels display green for authentic signatures, red for tampered images, and amber for images without signatures. Detailed signature information is shown in a structured grid layout.

### Watermark Heatmap
Toggle the heatmap overlay to visualize exactly which pixels contain the embedded watermark data, shown as an amber overlay on the image.

### Mobile View
Responsive design adapts to mobile screens with stacked layouts, touch-friendly buttons, and optimized spacing. The PWA can be installed to the home screen.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

Open Protocol - Cross-platform compatible
# SiliconSignature Web PWA - Deployed 2026-05-09T20:22:30Z
