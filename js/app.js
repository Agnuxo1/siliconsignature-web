/**
 * SiliconSignature PWA - Main Application
 * Handles UI interactions, image processing, signing/verification workflow,
 * localStorage history, and progress visualization.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const state = {
    originalImageData: null,
    signedImageData: null,
    currentFile: null,
    currentPayload: null,
    isProcessing: false,
    mode: 'idle', // 'idle', 'preview', 'signing', 'verifying'
    showHeatmap: false,
    history: loadHistory()
  };

  // ---------------------------------------------------------------------------
  // DOM Elements
  // ---------------------------------------------------------------------------

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    // Drop zone
    dropZone: $('.drop-zone'),
    dropZoneInner: $('.drop-zone-inner'),
    fileInput: $('#file-input'),

    // Canvas
    canvasOriginal: $('#canvas-original'),
    canvasHeatmap: $('#canvas-heatmap'),
    canvasContainer: $('.canvas-container'),
    imageInfo: $('.image-info'),

    // Actions
    actionPanel: $('.action-panel'),
    btnSign: $('#btn-sign'),
    btnVerify: $('#btn-verify'),
    btnDownload: $('#btn-download'),
    btnToggleHeatmap: $('#btn-toggle-heatmap'),
    btnReset: $('#btn-reset'),

    // Progress
    progressPanel: $('.progress-panel'),
    progressBar: $('.progress-bar-fill'),
    progressText: $('.progress-text'),
    progressStage: $('.progress-stage'),
    progressDetail: $('.progress-detail'),

    // Results
    resultPanel: $('.result-panel'),
    resultContent: $('.result-content'),
    resultStatus: $('.result-status'),

    // Signature details
    sigHash: $('#sig-hash'),
    sigNonce: $('#sig-nonce'),
    sigNtime: $('#sig-ntime'),
    sigVersion: $('#sig-version'),
    sigStatus: $('#sig-status'),
    sigCreator: $('#sig-creator'),
    sigTimestamp: $('#sig-timestamp'),

    // History
    historyPanel: $('.history-panel'),
    historyList: $('.history-list'),

    // Modal
    modal: $('.modal-overlay'),
    modalTitle: $('.modal-title'),
    modalBody: $('.modal-body'),
    modalClose: $('.modal-close'),

    // Nav
    navSign: $('#nav-sign'),
    navVerify: $('#nav-verify'),
    navHistory: $('#nav-history'),
    navAbout: $('#nav-about'),

    // Sections
    sectionSign: $('#section-sign'),
    sectionVerify: $('#section-verify'),
    sectionHistory: $('#section-history'),
    sectionAbout: $('#section-about'),
  };

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  function init() {
    bindEvents();
    renderHistory();
    showSection('sign');

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(console.error);
    }
  }

  function bindEvents() {
    // File input
    els.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    els.dropZone.addEventListener('dragover', handleDragOver);
    els.dropZone.addEventListener('dragleave', handleDragLeave);
    els.dropZone.addEventListener('drop', handleDrop);
    els.dropZone.addEventListener('click', () => els.fileInput.click());

    // Action buttons
    els.btnSign.addEventListener('click', startSigning);
    els.btnVerify.addEventListener('click', startVerification);
    els.btnDownload.addEventListener('click', downloadSignedImage);
    els.btnToggleHeatmap.addEventListener('click', toggleHeatmap);
    els.btnReset.addEventListener('click', resetAll);

    // Modal
    els.modalClose.addEventListener('click', closeModal);
    els.modal.addEventListener('click', (e) => {
      if (e.target === els.modal) closeModal();
    });

    // Navigation
    els.navSign.addEventListener('click', () => showSection('sign'));
    els.navVerify.addEventListener('click', () => showSection('verify'));
    els.navHistory.addEventListener('click', () => showSection('history'));
    els.navAbout.addEventListener('click', () => showSection('about'));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ---------------------------------------------------------------------------
  // Navigation / Sections
  // ---------------------------------------------------------------------------

  function showSection(section) {
    // Update nav
    $$('.nav-link').forEach(link => link.classList.remove('active'));
    $(`#nav-${section}`).classList.add('active');

    // Hide all sections
    $$('.section').forEach(sec => sec.classList.add('hidden'));

    // Show target section
    const target = $(`#section-${section}`);
    if (target) {
      target.classList.remove('hidden');
    }

    // Sign and verify share the same main UI
    if (section === 'sign' || section === 'verify') {
      els.sectionSign.classList.remove('hidden');
    }

    // Refresh history if shown
    if (section === 'history') {
      renderHistory();
    }
  }

  // ---------------------------------------------------------------------------
  // File Handling
  // ---------------------------------------------------------------------------

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    els.dropZone.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    els.dropZone.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    els.dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      loadFile(files[0]);
    }
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      loadFile(files[0]);
    }
  }

  function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      showModal('Invalid File', 'Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showModal('File Too Large', 'Maximum file size is 20MB.');
      return;
    }

    state.currentFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadImageToCanvas(img, file.name, file.size);
      };
      img.onerror = () => {
        showModal('Error', 'Failed to load image. The file may be corrupted.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function loadImageToCanvas(img, filename, fileSize) {
    const canvas = els.canvasOriginal;
    const ctx = canvas.getContext('2d');

    // Scale down if too large (for performance)
    const MAX_DIM = 2048;
    let { width, height } = img;

    if (width > MAX_DIM || height > MAX_DIM) {
      const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Store original image data
    state.originalImageData = ctx.getImageData(0, 0, width, height);
    state.signedImageData = null;
    state.currentPayload = null;

    // Show image info
    els.imageInfo.textContent = `${filename}  -  ${width} x ${height}  -  ${formatBytes(fileSize)}`;
    els.imageInfo.classList.remove('hidden');

    // Update UI
    canvas.classList.remove('hidden');
    els.dropZoneInner.classList.add('has-image');
    els.actionPanel.classList.remove('hidden');
    els.resultPanel.classList.add('hidden');
    els.progressPanel.classList.add('hidden');
    els.btnToggleHeatmap.classList.add('hidden');

    // Hide heatmap canvas
    els.canvasHeatmap.classList.add('hidden');
    state.showHeatmap = false;
  }

  // ---------------------------------------------------------------------------
  // Signing Workflow
  // ---------------------------------------------------------------------------

  async function startSigning() {
    if (state.isProcessing || !state.originalImageData) return;

    const creatorId = $('#creator-id').value.trim() || 'silicon_signature_web';

    state.isProcessing = true;
    state.mode = 'signing';
    setUIProcessing(true);

    showProgressPanel();
    updateProgress(0, 'Preparing to sign...', '');

    try {
      const startTime = Date.now();

      // Run signing
      const result = await SiliconWatermark.softwareSign(
        state.originalImageData,
        creatorId,
        (progress) => {
          if (progress.stage === 'mining') {
            const pct = Math.min(99, (Math.log10(progress.attempts + 1) / 10) * 100);
            updateProgress(
              pct,
              'Searching for valid nonce...',
              `Attempts: ${formatNumber(progress.attempts)}  |  ` +
              `Rate: ${formatNumber(progress.hashRate)} H/s  |  ` +
              `Time: ${formatTime(progress.elapsed)}`
            );
          } else if (progress.stage === 'embedding') {
            updateProgress(100, 'Embedding watermark...', '');
          }
        }
      );

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      state.signedImageData = result.imageData;
      state.currentPayload = result.signature;

      // Display the signed image
      const canvas = els.canvasOriginal;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(result.imageData, 0, 0);

      // Update UI
      hideProgressPanel();
      showResult('success', 'Image Signed Successfully', `
        <div class="result-detail">
          <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value status-badge success">SIGNED</span></div>
          <div class="detail-row"><span class="detail-label">Mining Time</span><span class="detail-value">${elapsed}s</span></div>
          <div class="detail-row"><span class="detail-label">Nonce Attempts</span><span class="detail-value">${formatNumber(result.nonceAttempts)}</span></div>
          <div class="detail-row"><span class="detail-label">Creator</span><span class="detail-value">${escapeHtml(result.signature.creator_id)}</span></div>
          <div class="detail-row"><span class="detail-label">Timestamp</span><span class="detail-value">${formatTimestamp(result.signature.timestamp)}</span></div>
        </div>
      `);

      // Show signature details
      showSignatureDetails(result.signature);

      // Show action buttons
      els.btnDownload.classList.remove('hidden');
      els.btnToggleHeatmap.classList.remove('hidden');

      // Add to history
      addHistoryEntry('sign', state.currentFile.name, result.signature, true);

      // Generate heatmap for later viewing
      generateHeatmapData();

    } catch (err) {
      console.error('Signing error:', err);
      hideProgressPanel();
      showResult('error', 'Signing Failed', `
        <p class="error-message">${escapeHtml(err.message || 'An unexpected error occurred.')}</p>
        <p>Try again with a different image or smaller difficulty.</p>
      `);
    } finally {
      state.isProcessing = false;
      state.mode = 'idle';
      setUIProcessing(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Verification Workflow
  // ---------------------------------------------------------------------------

  async function startVerification() {
    if (state.isProcessing || !state.originalImageData) return;

    state.isProcessing = true;
    state.mode = 'verifying';
    setUIProcessing(true);

    showProgressPanel();
    updateProgress(50, 'Extracting watermark...', 'Scanning LSB channels for signature data');

    try {
      // Small delay to show progress
      await new Promise(r => setTimeout(r, 300));

      updateProgress(75, 'Decoding signature...', 'Applying Reed-Solomon error correction');

      // Extract watermark
      const payload = SiliconWatermark.extractWatermark(state.originalImageData);

      await new Promise(r => setTimeout(r, 200));
      updateProgress(100, 'Verifying...', '');

      await new Promise(r => setTimeout(r, 200));

      if (payload) {
        state.currentPayload = payload;
        const verifyResult = SiliconWatermark.verifySignature(state.originalImageData, payload);

        // Show signature details
        showSignatureDetails(payload);

        if (verifyResult.verified) {
          showResult('success', 'Signature Verified', `
            <div class="result-detail">
              <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value status-badge success">AUTHENTIC</span></div>
              <div class="detail-row"><span class="detail-label">Confidence</span><span class="detail-value">100%</span></div>
              <div class="detail-row"><span class="detail-label">Integrity</span><span class="detail-value">${verifyResult.integrity}</span></div>
              <div class="detail-row"><span class="detail-label">Creator</span><span class="detail-value">${escapeHtml(payload.creator_id || 'Unknown')}</span></div>
              <div class="detail-row"><span class="detail-label">Timestamp</span><span class="detail-value">${formatTimestamp(payload.timestamp)}</span></div>
              <div class="detail-row"><span class="detail-label">Version</span><span class="detail-value">${escapeHtml(payload.version)}</span></div>
            </div>
            <p class="verify-note">This image contains a valid SiliconSignature watermark.</p>
          `);
        } else {
          showResult('error', 'Verification Failed', `
            <div class="result-detail">
              <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value status-badge error">INVALID</span></div>
              <div class="detail-row"><span class="detail-label">Message</span><span class="detail-value">${escapeHtml(verifyResult.message)}</span></div>
            </div>
          `);
        }

        addHistoryEntry('verify', state.currentFile.name, payload, verifyResult.verified);
      } else {
        showResult('warning', 'No Signature Found', `
          <div class="result-detail">
            <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value status-badge warning">NOT SIGNED</span></div>
            <div class="detail-row"><span class="detail-label">Confidence</span><span class="detail-value">N/A</span></div>
          </div>
          <p class="verify-note">This image does not contain a SiliconSignature watermark.</p>
        `);

        // Hide signature details
        $('.sig-details').classList.add('hidden');
        addHistoryEntry('verify', state.currentFile.name, null, false);
      }

      hideProgressPanel();

    } catch (err) {
      console.error('Verification error:', err);
      hideProgressPanel();
      showResult('error', 'Verification Error', `
        <p class="error-message">${escapeHtml(err.message || 'An unexpected error occurred.')}</p>
      `);
    } finally {
      state.isProcessing = false;
      state.mode = 'idle';
      setUIProcessing(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Signature Details Display
  // ---------------------------------------------------------------------------

  function showSignatureDetails(payload) {
    if (!payload) {
      $('.sig-details').classList.add('hidden');
      return;
    }

    els.sigHash.textContent = payload.hash || 'N/A';
    els.sigNonce.textContent = payload.nonce || 'N/A';
    els.sigNtime.textContent = payload.ntime || 'N/A';
    els.sigVersion.textContent = payload.version || 'N/A';
    els.sigStatus.textContent = payload.status || 'N/A';
    els.sigCreator.textContent = payload.creator_id || 'N/A';
    els.sigTimestamp.textContent = formatTimestamp(payload.timestamp);

    $('.sig-details').classList.remove('hidden');
  }

  // ---------------------------------------------------------------------------
  // Heatmap
  // ---------------------------------------------------------------------------

  function generateHeatmapData() {
    if (!state.originalImageData || !state.signedImageData) return;

    const result = SiliconWatermark.generateHeatmap(state.originalImageData, state.signedImageData);

    const canvas = els.canvasHeatmap;
    canvas.width = state.originalImageData.width;
    canvas.height = state.originalImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(result.heatmap, 0, 0);
  }

  function toggleHeatmap() {
    if (!state.signedImageData) return;

    state.showHeatmap = !state.showHeatmap;

    if (state.showHeatmap) {
      els.canvasHeatmap.classList.remove('hidden');
      els.btnToggleHeatmap.textContent = 'Hide Heatmap';
      els.btnToggleHeatmap.classList.add('active');
    } else {
      els.canvasHeatmap.classList.add('hidden');
      els.btnToggleHeatmap.textContent = 'Show Watermark Heatmap';
      els.btnToggleHeatmap.classList.remove('active');
    }
  }

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------

  function downloadSignedImage() {
    if (!state.signedImageData) return;

    const canvas = els.canvasOriginal;
    const link = document.createElement('a');
    const timestamp = Date.now();
    link.download = `signed_${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  function resetAll() {
    state.originalImageData = null;
    state.signedImageData = null;
    state.currentFile = null;
    state.currentPayload = null;
    state.showHeatmap = false;

    // Clear canvas
    const canvas = els.canvasOriginal;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.add('hidden');

    // Clear heatmap canvas
    const heatCanvas = els.canvasHeatmap;
    const heatCtx = heatCanvas.getContext('2d');
    heatCtx.clearRect(0, 0, heatCanvas.width, heatCanvas.height);
    heatCanvas.classList.add('hidden');

    // Reset UI
    els.dropZoneInner.classList.remove('has-image');
    els.imageInfo.classList.add('hidden');
    els.actionPanel.classList.add('hidden');
    els.resultPanel.classList.add('hidden');
    els.progressPanel.classList.add('hidden');
    els.btnDownload.classList.add('hidden');
    els.btnToggleHeatmap.classList.add('hidden');
    $('.sig-details').classList.add('hidden');
    els.fileInput.value = '';
    $('#creator-id').value = '';
  }

  // ---------------------------------------------------------------------------
  // Progress UI
  // ---------------------------------------------------------------------------

  function showProgressPanel() {
    els.progressPanel.classList.remove('hidden');
    els.resultPanel.classList.add('hidden');
  }

  function hideProgressPanel() {
    els.progressPanel.classList.add('hidden');
  }

  function updateProgress(percent, stage, detail) {
    els.progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    els.progressText.textContent = `${Math.round(percent)}%`;
    els.progressStage.textContent = stage;
    els.progressDetail.textContent = detail;
  }

  // ---------------------------------------------------------------------------
  // Result UI
  // ---------------------------------------------------------------------------

  function showResult(type, title, html) {
    els.resultPanel.classList.remove('hidden', 'success', 'error', 'warning');
    els.resultPanel.classList.add(type);

    els.resultStatus.textContent = title;
    els.resultContent.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------------------

  function showModal(title, body) {
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = body;
    els.modal.classList.remove('hidden');
  }

  function closeModal() {
    els.modal.classList.add('hidden');
  }

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  function addHistoryEntry(type, filename, signature, success) {
    const entry = {
      type,
      filename,
      signature: signature ? { ...signature } : null,
      success,
      date: Date.now()
    };

    state.history.unshift(entry);
    if (state.history.length > 50) {
      state.history = state.history.slice(0, 50);
    }

    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      els.historyList.innerHTML = `
        <div class="history-empty">
          <div class="empty-icon">H</div>
          <p>No history yet. Sign or verify an image to see it here.</p>
        </div>
      `;
      return;
    }

    els.historyList.innerHTML = state.history.map((entry, i) => {
      const icon = entry.type === 'sign' ? 'S' : 'V';
      const typeLabel = entry.type === 'sign' ? 'Signed' : 'Verified';
      const statusClass = entry.success ? 'success' : (entry.signature ? 'error' : 'warning');
      const statusLabel = entry.success ? 'SUCCESS' : (entry.signature ? 'FAILED' : 'NOT SIGNED');

      return `
        <div class="history-item" data-index="${i}">
          <div class="history-icon ${entry.type}">${icon}</div>
          <div class="history-info">
            <div class="history-filename" title="${escapeHtml(entry.filename)}">${escapeHtml(truncate(entry.filename, 30))}</div>
            <div class="history-meta">
              <span class="history-type">${typeLabel}</span>
              <span class="history-date">${formatDate(entry.date)}</span>
            </div>
          </div>
          <div class="history-status ${statusClass}">${statusLabel}</div>
        </div>
      `;
    }).join('');

    // Click to view details
    $$('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const entry = state.history[idx];
        if (entry.signature) {
          showModal('Signature Details', `
            <div class="modal-sig-details">
              <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${entry.type === 'sign' ? 'Signed' : 'Verified'}</span></div>
              <div class="detail-row"><span class="detail-label">File</span><span class="detail-value">${escapeHtml(entry.filename)}</span></div>
              <div class="detail-row"><span class="detail-label">Result</span><span class="detail-value status-badge ${entry.success ? 'success' : 'error'}">${entry.success ? 'SUCCESS' : 'FAILED'}</span></div>
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(entry.date)}</span></div>
              <hr>
              <div class="detail-row"><span class="detail-label">Hash</span><span class="detail-value mono">${escapeHtml(entry.signature.hash)}</span></div>
              <div class="detail-row"><span class="detail-label">Nonce</span><span class="detail-value mono">${escapeHtml(entry.signature.nonce)}</span></div>
              <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${escapeHtml(entry.signature.status)}</span></div>
              <div class="detail-row"><span class="detail-label">Creator</span><span class="detail-value">${escapeHtml(entry.signature.creator_id || 'N/A')}</span></div>
              <div class="detail-row"><span class="detail-label">Timestamp</span><span class="detail-value">${formatTimestamp(entry.signature.timestamp)}</span></div>
            </div>
          `);
        } else {
          showModal('Entry Details', `
            <div class="modal-sig-details">
              <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${entry.type === 'sign' ? 'Signed' : 'Verified'}</span></div>
              <div class="detail-row"><span class="detail-label">File</span><span class="detail-value">${escapeHtml(entry.filename)}</span></div>
              <div class="detail-row"><span class="detail-label">Result</span><span class="detail-value status-badge warning">NOT SIGNED</span></div>
              <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(entry.date)}</span></div>
            </div>
          `);
        }
      });
    });
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem('siliconsignature_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('siliconsignature_history', JSON.stringify(state.history));
    } catch (e) {
      // localStorage may be full
    }
  }

  // ---------------------------------------------------------------------------
  // UI Helpers
  // ---------------------------------------------------------------------------

  function setUIProcessing(processing) {
    els.btnSign.disabled = processing;
    els.btnVerify.disabled = processing;
    els.btnSign.classList.toggle('processing', processing);
    els.btnVerify.classList.toggle('processing', processing);
  }

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function formatTime(seconds) {
    if (seconds < 60) return seconds.toFixed(1) + 's';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }

  function formatTimestamp(ts) {
    if (!ts) return 'N/A';
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  }

  function formatDate(ts) {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function truncate(str, len) {
    if (str.length <= len) return str;
    return str.substring(0, len - 3) + '...';
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
