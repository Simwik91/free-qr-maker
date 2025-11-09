// Constants
const PREFERENCES_KEY = 'qrPreferences';
const MAX_BULK_ITEMS = 500;
const BATCH_SIZE = 3;
const SCAN_INTERVAL = 300;

// DOM Selectors - Centralized configuration
const DOMSelectors = {
    // Single QR Code Elements
    qrType: '#qr-type',
    qrInput: '#qr-input',
    vcardName: '#vcard-name',
    vcardPhone: '#vcard-phone',
    vcardEmail: '#vcard-email',
    wifiSsid: '#wifi-ssid',
    wifiPassword: '#wifi-password',
    wifiType: '#wifi-type',
    smsPhone: '#sms-phone',
    smsMessage: '#sms-message',
    emailAddress: '#email-address',
    emailSubject: '#email-subject',
    emailBody: '#email-body',
    qrCanvas: '#qr-canvas',
    fgColor: '#fg-color',
    bgColor: '#bg-color',
    transparentBg: '#transparent-bg',
    sizeSlider: '#size-slider',
    sizeValue: '#size-value',
    borderSize: '#border-size',
    borderSizeValue: '#border-size-value',
    borderColor: '#border-color',
    logoSize: '#logo-size',
    logoSizeValue: '#logo-size-value',
    logoUpload: '#logo-upload',
    logoUploadArea: '#logo-upload-area',
    logoPreview: '#logo-preview',
    qrLoading: '#qr-loading',
    qrError: '#qr-error',
    qrSuccess: '#qr-success',
    downloadBtn: '#download-btn',
    
    // Bulk QR Code Elements
    bulkTransparentBg: '#bulk-transparent-bg',
    bulkInput: '#bulk-input',
    bulkFileUpload: '#bulk-file-upload',
    bulkFilename: '#bulk-filename',
    bulkLoading: '#bulk-loading',
    bulkProgress: '#bulk-progress',
    bulkSuccess: '#bulk-success',
    bulkError: '#bulk-error',
    bulkFgColor: '#bulk-fg-color',
    bulkBgColor: '#bulk-bg-color',
    bulkSizeSlider: '#bulk-size-slider',
    bulkSizeValue: '#bulk-size-value',
    bulkBorderSize: '#bulk-border-size',
    bulkBorderSizeValue: '#bulk-border-size-value',
    bulkBorderColor: '#bulk-border-color',
    bulkLogoSize: '#bulk-logo-size',
    bulkLogoSizeValue: '#bulk-logo-size-value',
    bulkLogoUpload: '#bulk-logo-upload',
    bulkLogoUploadArea: '#bulk-logo-upload-area',
    bulkLogoPreview: '#bulk-logo-preview',
    bulkInputType: '#bulk-input-type',
    bulkListFields: '#bulk-list-fields',
    bulkRangeFields: '#bulk-range-fields',
    rangeStart: '#range-start',
    rangeEnd: '#range-end',
    rangePrefix: '#range-prefix',
    rangeSuffix: '#range-suffix',
    
    // Scanner Elements
    video: '#scanner-video',
    scanResult: '#scan-result',
    startScan: '#start-scan',
    stopScan: '#stop-scan',
    scannerOverlay: '#scanner-overlay',
    scannerStatus: '#scanner-status',
    scannerGuides: '#scanner-guides',
    fileUpload: '#file-upload',
    
    // Tab Elements
    tabs: '.tab',
    tabContents: '.tab-content'
};

// Application State
const AppState = {
    currentStream: null,
    currentScanInterval: null,
    logoImage: null,
    bulkLogoImage: null,
    generatedQR: null,
    bulkQRs: [],
    isGenerating: false
};

// Global elements reference
let globalElements = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeApp();
    } catch (error) {
        QRErrorHandler.handle(error, 'App Initialization');
    }
});

async function initializeApp() {
    globalElements = initializeDOMElements();
    setupEventListeners(globalElements);
    initializeUI(globalElements);
    loadQRPreferences(globalElements);
    
    // Add cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
}

function initializeDOMElements() {
    const elements = {};
    
    for (const [key, selector] of Object.entries(DOMSelectors)) {
        try {
            if (key === 'tabs' || key === 'tabContents') {
                elements[key] = document.querySelectorAll(selector);
            } else {
                elements[key] = document.querySelector(selector);
            }
        } catch (error) {
            console.warn(`Element not found: ${selector}`, error);
            elements[key] = null;
        }
    }
    
    return elements;
}

function setupEventListeners(elements) {
    // Event delegation for tabs
    if (elements.tabs) {
        document.querySelector('.tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) switchTab(tab.dataset.tab, elements);
        });
    }

    // Input handlers with event delegation
    document.addEventListener('input', (e) => {
        const { target } = e;
        
        // Size sliders
        if (target.matches('.size-slider')) {
            handleSliderChange(target, elements);
        }
        
        // Color inputs
        if (target.matches('input[type="color"]')) {
            saveQRPreferences(elements);
        }
        
        // Border controls
        if (target.id === 'border-size' || target.id === 'border-color') {
            updateBorderPreview(elements);
        }
        if (target.id === 'bulk-border-size' || target.id === 'bulk-border-color') {
            updateBulkBorderPreview(elements);
        }
    });

    // Change handlers
    document.addEventListener('change', (e) => {
        const { target } = e;
        
        if (target.id === 'qr-type') {
            toggleQRTypeFields(elements);
        }
        
        if (target.matches('input[name="bulk-type"]')) {
            handleBulkTypeChange(elements);
        }
        
        if (target.id === 'logo-upload') {
            handleLogoUpload(e, elements);
        }
        
        if (target.id === 'bulk-logo-upload') {
            handleBulkLogoUpload(e, elements);
        }
        
        if (target.id === 'file-upload') {
            handleFileUpload(e, elements);
        }
        
        if (target.id === 'bulk-file-upload') {
            handleBulkFileUpload(e, elements);
        }
    });

    // Button handlers
    if (elements.startScan) {
        elements.startScan.addEventListener('click', () => startScanner(elements));
    }
    
    if (elements.stopScan) {
        elements.stopScan.addEventListener('click', () => stopScanner());
    }

    // Keyboard shortcuts
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.id === 'qr-input') {
            generateQR(globalElements || initializeDOMElements());
        }
    });

    // Drag and drop setup
    setupDragAndDrop('logo-upload-area', (e) => handleLogoUpload(e, elements));
    setupDragAndDrop('bulk-logo-upload-area', (e) => handleBulkLogoUpload(e, elements));
}

function setupDragAndDrop(areaId, handler) {
    const area = document.getElementById(areaId);
    if (!area) return;

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.remove('drag-over'), false);
    });

    area.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length) handler({ target: { files } });
    }, false);
}

function initializeUI(elements) {
    updateSizeValue(elements);
    updateBorderSizeValue(elements);
    updateLogoSizeValue(elements);
    updateBulkLogoSizeValue(elements);
    updateBorderPreview(elements);
    updateBulkBorderPreview(elements);
    toggleQRTypeFields(elements);
    initBulkInputType(elements);
}

function handleSliderChange(target, elements) {
    const valueDisplays = {
        'size-slider': elements.sizeValue,
        'border-size': elements.borderSizeValue,
        'logo-size': elements.logoSizeValue,
        'bulk-size-slider': elements.bulkSizeValue,
        'bulk-border-size': elements.bulkBorderSizeValue,
        'bulk-logo-size': elements.bulkLogoSizeValue
    };
    
    const display = valueDisplays[target.id];
    if (display) {
        const suffix = target.id.includes('logo-size') ? '%' : 'px';
        display.textContent = `${target.value}${suffix}`;
    }
    
    if (target.id === 'border-size' || target.id === 'logo-size') {
        updateBorderPreview(elements);
    } else if (target.id === 'bulk-border-size' || target.id === 'bulk-logo-size') {
        updateBulkBorderPreview(elements);
    }
}

function updateSizeValue(elements) {
    if (elements.sizeValue && elements.sizeSlider) {
        elements.sizeValue.textContent = `${elements.sizeSlider.value}px`;
    }
}

function updateBorderSizeValue(elements) {
    if (elements.borderSizeValue && elements.borderSize) {
        elements.borderSizeValue.textContent = `${elements.borderSize.value}px`;
    }
}

function updateLogoSizeValue(elements) {
    if (elements.logoSizeValue && elements.logoSize) {
        elements.logoSizeValue.textContent = `${elements.logoSize.value}%`;
    }
}

function updateBulkLogoSizeValue(elements) {
    if (elements.bulkLogoSizeValue && elements.bulkLogoSize) {
        elements.bulkLogoSizeValue.textContent = `${elements.bulkLogoSize.value}%`;
    }
}

function updateBorderPreview(elements) {
    if (!elements.borderPreview) return;
    
    const borderSizeVal = parseInt(elements.borderSize?.value || 0);
    const borderColorVal = elements.borderColor?.value || '#FFFFFF';
    
    if (borderSizeVal > 0) {
        elements.borderPreview.style.border = `${borderSizeVal}px solid ${borderColorVal}`;
        if (elements.logoUploadArea) elements.logoUploadArea.classList.add('border-active');
    } else {
        elements.borderPreview.style.border = 'none';
        if (elements.logoUploadArea) elements.logoUploadArea.classList.remove('border-active');
    }
}

function updateBulkBorderPreview(elements) {
    if (!elements.bulkBorderPreview) return;
    
    const borderSizeVal = parseInt(elements.bulkBorderSize?.value || 0);
    const borderColorVal = elements.bulkBorderColor?.value || '#FFFFFF';
    
    if (borderSizeVal > 0) {
        elements.bulkBorderPreview.style.border = `${borderSizeVal}px solid ${borderColorVal}`;
        if (elements.bulkLogoUploadArea) elements.bulkLogoUploadArea.classList.add('border-active');
    } else {
        elements.bulkBorderPreview.style.border = 'none';
        if (elements.bulkLogoUploadArea) elements.bulkLogoUploadArea.classList.remove('border-active');
    }
}

function initBulkInputType(elements) {
    const bulkTypeRadios = document.querySelectorAll('input[name="bulk-type"]');
    const bulkInputLabels = document.querySelectorAll('#bulk-input-type label');
    
    if (!bulkTypeRadios.length || !bulkInputLabels.length) return;
    
    function updateActiveState() {
        bulkInputLabels.forEach(label => label.classList.remove('active'));
        const checkedRadio = document.querySelector('input[name="bulk-type"]:checked');
        if (checkedRadio) checkedRadio.closest('label').classList.add('active');
    }
    
    updateActiveState();
    
    bulkTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateActiveState();
            
            if (elements.bulkListFields) elements.bulkListFields.style.display = 'none';
            if (elements.bulkRangeFields) elements.bulkRangeFields.style.display = 'none';
            
            if (radio.value === 'list' && elements.bulkListFields) {
                elements.bulkListFields.style.display = 'block';
            } else if (radio.value === 'range' && elements.bulkRangeFields) {
                elements.bulkRangeFields.style.display = 'block';
            }
        });
    });
}

function handleBulkTypeChange(elements) {
    const bulkType = document.querySelector('input[name="bulk-type"]:checked')?.value;
    
    if (elements.bulkListFields) elements.bulkListFields.style.display = 'none';
    if (elements.bulkRangeFields) elements.bulkRangeFields.style.display = 'none';
    
    if (bulkType === 'list' && elements.bulkListFields) {
        elements.bulkListFields.style.display = 'block';
    } else if (bulkType === 'range' && elements.bulkRangeFields) {
        elements.bulkRangeFields.style.display = 'block';
    }
}

function switchTab(tabName, elements) {
    // Update tabs
    elements.tabs?.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    elements.tabContents?.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}-tab`);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activeContent.classList.add('active');
    }
    
    // Stop scanner when switching away from scan tab
    if (tabName !== 'scan' && AppState.currentStream) {
        stopScanner();
    }
}

function toggleQRTypeFields(elements) {
    const type = elements.qrType?.value;
    if (!type) return;
    
    document.querySelectorAll('.qr-type-fields').forEach(field => field.classList.remove('active'));
    const activeFields = document.getElementById(`${type}-fields`);
    if (activeFields) activeFields.classList.add('active');
}

// Logo Handling
async function handleLogoUpload(e, elements) {
    await handleLogoUploadGeneric(e, elements, {
        imageRef: 'logoImage',
        previewElement: elements.logoPreview,
        errorElement: elements.qrError,
        borderPreviewId: 'border-preview',
        updatePreview: () => updateBorderPreview(elements)
    });
}

async function handleBulkLogoUpload(e, elements) {
    await handleLogoUploadGeneric(e, elements, {
        imageRef: 'bulkLogoImage',
        previewElement: elements.bulkLogoPreview,
        errorElement: elements.bulkError,
        borderPreviewId: 'bulk-border-preview',
        updatePreview: () => updateBulkBorderPreview(elements)
    });
}

async function handleLogoUploadGeneric(e, elements, config) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        showError(config.errorElement, 'Please upload a valid image file');
        return;
    }

    try {
        const imageData = await readFileAsDataURL(file);
        AppState[config.imageRef] = await loadImage(imageData);
        updateLogoPreview(config.previewElement, imageData, config.borderPreviewId);
        config.updatePreview();
    } catch (error) {
        showError(config.errorElement, 'Error loading image: ' + error.message);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

function updateLogoPreview(previewElement, imageData, borderPreviewId) {
    if (!previewElement) return;
    
    previewElement.innerHTML = '';
    const previewContainer = document.createElement('div');
    previewContainer.className = 'border-preview';
    
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Uploaded logo';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    const borderIndicator = document.createElement('div');
    borderIndicator.className = 'border-indicator';
    borderIndicator.id = borderPreviewId;
    
    previewContainer.appendChild(img);
    previewContainer.appendChild(borderIndicator);
    previewElement.appendChild(previewContainer);
}

// QR Code Generation
async function generateQR(elements) {
    if (AppState.isGenerating) return;
    
    try {
        AppState.isGenerating = true;
        const type = elements.qrType.value;
        const content = getQRContent(type, elements);
        
        const qrOptions = {
            size: parseInt(elements.sizeSlider.value),
            fgColor: elements.fgColor.value,
            bgColor: elements.transparentBg.checked ? '#00000000' : elements.bgColor.value
        };
        
        showLoading(elements.qrLoading, elements.qrError, elements.qrSuccess);
        
        const generatedCanvas = await createQRCanvas(content, qrOptions);
        const finalCanvas = await addLogoToQR(
            generatedCanvas, 
            AppState.logoImage, 
            parseInt(elements.borderSize.value), 
            elements.borderColor.value,
            parseInt(elements.logoSize.value)
        );
        
        displayQRResult(finalCanvas, content, elements);
        testQRScannability(finalCanvas, content, elements);
        saveQRPreferences(elements);
        
    } catch (error) {
        showError(elements.qrError, error.message || 'Error generating QR code');
    } finally {
        AppState.isGenerating = false;
    }
}

function getQRContent(type, elements) {
    switch(type) {
        case 'url':
            const url = elements.qrInput.value.trim();
            if (!url) throw new Error('URL is required');
            return autoFormatURL(url);
            
        case 'vcard':
            const name = elements.vcardName.value.trim();
            const phone = elements.vcardPhone.value.trim();
            const email = elements.vcardEmail.value.trim();
            
            if (!name || !phone || !email) throw new Error('All vCard fields are required');
            if (!isValidEmail(email)) throw new Error('Invalid email format');
            
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            
        case 'wifi':
            const ssid = elements.wifiSsid.value.trim();
            const password = elements.wifiPassword.value.trim();
            const encryption = elements.wifiType.value;
            
            if (!ssid) throw new Error('Network name is required');
            if (encryption !== 'nopass' && !password) throw new Error('Password is required');
            
            return `WIFI:S:${ssid};T:${encryption};P:${password};;`;
            
        case 'email':
            const emailAddr = elements.emailAddress.value.trim();
            const subject = elements.emailSubject.value.trim();
            const body = elements.emailBody.value.trim();
            
            if (!emailAddr) throw new Error('Email address is required');
            if (!isValidEmail(emailAddr)) throw new Error('Invalid email format');
            
            return `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
        default:
            const input = elements.qrInput.value.trim();
            if (!input) throw new Error('Content is required');
            return input;
    }
}

function autoFormatURL(input) {
    if (input.includes('.') && !input.startsWith('http://') && !input.startsWith('https://')) {
        return `https://${input}`;
    }
    return input;
}

function createQRCanvas(content, options) {
    return new Promise((resolve, reject) => {
        try {
            QRCode.toCanvas(content, {
                width: options.size,
                margin: 2,
                color: {
                    dark: options.fgColor,
                    light: options.bgColor
                },
                errorCorrectionLevel: 'Q'
            }, (error, canvas) => {
                if (error) reject(error);
                else resolve(canvas);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function addLogoToQR(qrCanvas, logo, borderSize, borderColor, logoSizePercent) {
    if (!logo) return qrCanvas;
    
    try {
        const maxSafeSize = qrCanvas.width * 0.25;
        const actualLogoSize = Math.min(
            qrCanvas.width * (logoSizePercent / 100), 
            maxSafeSize
        );
        
        const ctx = qrCanvas.getContext('2d');
        
        // Draw border if needed
        if (borderSize > 0) {
            ctx.fillStyle = borderColor;
            const centerX = qrCanvas.width / 2;
            const centerY = qrCanvas.height / 2;
            const borderWidth = actualLogoSize + borderSize * 2;
            const maxBorderWidth = qrCanvas.width * 0.35;
            const safeBorderWidth = Math.min(borderWidth, maxBorderWidth);
            
            ctx.fillRect(
                centerX - safeBorderWidth/2,
                centerY - safeBorderWidth/2,
                safeBorderWidth,
                safeBorderWidth
            );
        }
        
        // Draw logo
        ctx.drawImage(
            logo,
            (qrCanvas.width - actualLogoSize) / 2,
            (qrCanvas.height - actualLogoSize) / 2,
            actualLogoSize,
            actualLogoSize
        );
        
        return qrCanvas;
    } catch (error) {
        console.error('Error adding logo to QR:', error);
        return qrCanvas; // Return original canvas if logo fails
    }
}

function displayQRResult(canvas, content, elements) {
    elements.qrCanvas.width = canvas.width;
    elements.qrCanvas.height = canvas.height;
    const ctx = elements.qrCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    
    AppState.generatedQR = { 
        data: elements.qrCanvas.toDataURL('image/png'), 
        content 
    };
    
    elements.qrLoading.style.display = 'none';
    elements.qrSuccess.style.display = 'block';
    elements.qrSuccess.textContent = 'QR Code generated successfully!';
    elements.downloadBtn.style.display = 'block';
    elements.qrCanvas.style.display = 'block';
}

function testQRScannability(canvas, originalContent, elements) {
    try {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (!code) {
            elements.qrSuccess.innerHTML += '<br><span class="scanner-error"><i class="fas fa-exclamation-circle"></i> Warning: QR code may be difficult to scan</span>';
        } else if (code.data !== originalContent) {
            elements.qrSuccess.innerHTML += `<br><span class="scanner-error"><i class="fas fa-exclamation-circle"></i> Content mismatch: ${code.data.substr(0, 20)}...</span>`;
        } else {
            elements.qrSuccess.innerHTML += '<br><span class="scanner-success"><i class="fas fa-check-circle"></i> QR code scans successfully</span>';
        }
    } catch (e) {
        console.log('QR test error:', e);
    }
}

// Bulk QR Generation
async function generateBulkQR(elements) {
    if (AppState.isGenerating) return;
    
    try {
        AppState.isGenerating = true;
        const inputs = await getBulkInputs(elements);
        
        if (inputs.length === 0) throw new Error('Please enter at least one item');
        if (inputs.length > MAX_BULK_ITEMS) throw new Error(`For performance, limit to ${MAX_BULK_ITEMS} items at a time`);

        AppState.bulkQRs = [];
        showLoading(elements.bulkLoading, elements.bulkError, elements.bulkSuccess);

        // Process in batches
        for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
            const batch = inputs.slice(i, i + BATCH_SIZE);
            await processBatch(batch, i, inputs.length, elements);
        }

        await createBulkZip(elements);
        
    } catch (error) {
        showError(elements.bulkError, error.message || 'Error generating bulk QR codes');
    } finally {
        AppState.isGenerating = false;
    }
}

async function getBulkInputs(elements) {
    const bulkType = document.querySelector('input[name="bulk-type"]:checked').value;
    
    if (bulkType === 'list') {
        if (elements.bulkFileUpload.files.length) {
            return await parseCSVFile(elements.bulkFileUpload.files[0]);
        } else {
            return elements.bulkInput.value.trim().split('\n').filter(line => line.trim() !== '');
        }
    } else {
        const start = parseInt(elements.rangeStart.value);
        const end = parseInt(elements.rangeEnd.value);
        const prefix = elements.rangePrefix.value.trim();
        const suffix = elements.rangeSuffix.value.trim();
        
        if (isNaN(start) || isNaN(end) || start > end) {
            throw new Error('Please enter valid start and end numbers');
        }
        
        const inputs = [];
        for (let i = start; i <= end; i++) {
            inputs.push(`${prefix}${i}${suffix}`);
        }
        return inputs;
    }
}

async function parseCSVFile(file) {
    const text = await readFileAsText(file);
    const results = Papa.parse(text, { header: true });
    
    if (results.errors.length) throw new Error('Error parsing CSV file');
    
    return results.data.map(row => {
        return Object.values(row).find(val => val && val.trim() !== '') || '';
    }).filter(val => val.trim() !== '');
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

async function processBatch(batch, startIndex, total, elements) {
    const promises = batch.map(async (input, batchIndex) => {
        const index = startIndex + batchIndex;
        elements.bulkProgress.textContent = `Generating QR codes: ${index + 1}/${total}`;
        
        try {
            const qrOptions = {
                size: parseInt(elements.bulkSizeSlider.value),
                fgColor: elements.bulkFgColor.value,
                bgColor: elements.bulkTransparentBg.checked ? '#00000000' : elements.bulkBgColor.value
            };
            
            const generatedCanvas = await createQRCanvas(input, qrOptions);
            const finalCanvas = await addLogoToQR(
                generatedCanvas, 
                AppState.bulkLogoImage, 
                parseInt(elements.bulkBorderSize.value), 
                elements.bulkBorderColor.value,
                parseInt(elements.bulkLogoSize.value)
            );
            
            AppState.bulkQRs.push({
                content: input,
                dataURL: finalCanvas.toDataURL('image/png')
            });
            
            // Clean up
            generatedCanvas.width = generatedCanvas.height = 0;
            
        } catch (error) {
            console.error('Error generating QR code for: ' + input, error);
            AppState.bulkQRs.push({
                content: input,
                error: true,
                message: error.message
            });
        }
    });
    
    await Promise.all(promises);
}

async function createBulkZip(elements) {
    try {
        const zip = new JSZip();
        const prefix = elements.bulkFilename.value.trim() || 'qr-codes';
        let successCount = 0;

        for (let i = 0; i < AppState.bulkQRs.length; i++) {
            const item = AppState.bulkQRs[i];
            if (!item.error) {
                const filename = `${sanitizeFilename(prefix)}-${sanitizeFilename(item.content)}.png`;
                const data = item.dataURL.split(',')[1];
                zip.file(filename, data, { base64: true });
                successCount++;
            }
            
            // Update progress
            elements.bulkProgress.textContent = `Creating ZIP: ${i + 1}/${AppState.bulkQRs.length}`;
            
            // Yield to prevent blocking
            if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (successCount === 0) {
            throw new Error('No QR codes were generated successfully');
        }

        const content = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        saveAs(content, `${prefix}.zip`);
        elements.bulkLoading.style.display = 'none';
        elements.bulkSuccess.style.display = 'block';
        elements.bulkSuccess.textContent = `Successfully generated and downloaded ${successCount} QR codes!`;
        
        if (successCount < AppState.bulkQRs.length) {
            elements.bulkSuccess.textContent += ` (${AppState.bulkQRs.length - successCount} failed)`;
        }
        
        // Clean up
        AppState.bulkQRs = [];
        
    } catch (error) {
        elements.bulkLoading.style.display = 'none';
        showError(elements.bulkError, error.message || 'Error creating ZIP file');
    }
}

// Scanner Functions
async function startScanner(elements) {
    try {
        elements.scannerOverlay.style.display = 'flex';
        elements.scanResult.innerHTML = '<p>Scanning... Point camera at QR code</p>';
        updateScannerStatus('Scanning...', 'scanner-loading', elements);
        
        // Add scanning guides
        elements.scannerGuides.innerHTML = `
            <div class="guide-line horizontal" style="top: 33%"></div>
            <div class="guide-line horizontal" style="top: 66%"></div>
            <div class="guide-line vertical" style="left: 33%"></div>
            <div class="guide-line vertical" style="left: 66%"></div>
        `;
        elements.scannerGuides.style.display = 'block';

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        AppState.currentStream = stream;
        elements.video.srcObject = stream;
        await elements.video.play();
        
        AppState.currentScanInterval = setInterval(() => scanQR(elements), SCAN_INTERVAL);
        
    } catch (error) {
        elements.scanResult.innerHTML = `<p class="error">Error accessing camera: ${error.message}</p>`;
        updateScannerStatus('Camera Error', 'scanner-error', elements);
    }
}

function stopScanner() {
    if (AppState.currentStream) {
        AppState.currentStream.getTracks().forEach(track => track.stop());
        AppState.currentStream = null;
    }
    if (AppState.currentScanInterval) {
        clearInterval(AppState.currentScanInterval);
        AppState.currentScanInterval = null;
    }
    
    const overlay = document.getElementById('scanner-overlay');
    const guides = document.getElementById('scanner-guides');
    const status = document.getElementById('scanner-status');
    
    if (overlay) overlay.style.display = 'none';
    if (guides) guides.style.display = 'none';
    if (status) status.style.display = 'none';
}

function scanQR(elements) {
    if (!AppState.currentStream || !elements.video.readyState) return;

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = elements.video.videoWidth;
        canvas.height = elements.video.videoHeight;

        ctx.drawImage(elements.video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            elements.scanResult.innerHTML = `
                <p><strong>QR Code detected!</strong></p>
                <p><strong>Content:</strong> ${escapeHTML(code.data)}</p>
                <button onclick="useScannedContent('${code.data.replace(/'/g, "\\'")}')">
                    Generate this QR
                </button>
            `;
            updateScannerStatus('QR Code Detected!', 'scanner-success', elements);
        }
        
        // Clean up
        canvas.width = canvas.height = 0;
    } catch (error) {
        console.error('Scan error:', error);
    }
}

function updateScannerStatus(message, className, elements) {
    if (!elements.scannerStatus) return;
    elements.scannerStatus.textContent = message;
    elements.scannerStatus.className = `scanner-status ${className}`;
    elements.scannerStatus.style.display = 'block';
}

// File Upload Handlers
async function handleFileUpload(e, elements) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        elements.scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> Please upload a valid image file</p>';
        updateScannerStatus('Invalid File', 'scanner-error', elements);
        return;
    }

    updateScannerStatus('Processing image...', 'scanner-loading', elements);
    
    try {
        const imageData = await readFileAsDataURL(file);
        const img = await loadImage(imageData);
        scanQRFromImage(img, elements);
    } catch (error) {
        elements.scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> Error loading image</p>';
        updateScannerStatus('Image Error', 'scanner-error', elements);
    }
}

async function handleBulkFileUpload(e, elements) {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
        showError(elements.bulkError, 'Please upload a valid CSV file');
        return;
    }

    try {
        const text = await readFileAsText(file);
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        elements.bulkInput.value = lines.join('\n');
    } catch (error) {
        showError(elements.bulkError, 'Error reading CSV file');
    }
}

function scanQRFromImage(img, elements) {
    updateScannerStatus('Processing image...', 'scanner-loading', elements);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, canvas.height);

    if (code) {
        elements.scanResult.innerHTML = `
            <p><strong>QR Code detected in image!</strong></p>
            <p><strong>Content:</strong> ${escapeHTML(code.data)}</p>
            <button onclick="useScannedContent('${code.data.replace(/'/g, "\\'")}')">
                Generate this QR
            </button>
        `;
        updateScannerStatus('QR Code Found!', 'scanner-success', elements);
    } else {
        elements.scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> No QR code found in the image</p>';
        updateScannerStatus('No QR Found', 'scanner-error', elements);
    }
    
    // Clean up
    canvas.width = canvas.height = 0;
}

// Utility Functions
function useScannedContent(content) {
    stopScanner();
    const elements = globalElements || initializeDOMElements();
    
    if (elements.qrType && elements.qrInput) {
        elements.qrType.value = 'url';
        toggleQRTypeFields(elements);
        elements.qrInput.value = content;
        
        const singleTab = document.querySelector('[data-tab="single"]');
        if (singleTab) switchTab('single', elements);
        
        generateQR(elements);
    }
}

function downloadQR(elements) {
    if (!AppState.generatedQR) {
        showError(elements.qrError, 'Please generate a QR code first');
        return;
    }

    const filename = sanitizeFilename(AppState.generatedQR.content) + '.png';
    const a = document.createElement('a');
    a.href = AppState.generatedQR.data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 50);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showLoading(loadingElement, errorElement, successElement) {
    if (loadingElement) loadingElement.style.display = 'block';
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.style.display = 'none';
}

function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
}

// Preferences Management
function saveQRPreferences(elements) {
    const preferences = {
        fgColor: elements.fgColor?.value || '#000000',
        bgColor: elements.bgColor?.value || '#FFFFFF',
        size: elements.sizeSlider?.value || '256',
        borderSize: elements.borderSize?.value || '5',
        borderColor: elements.borderColor?.value || '#FFFFFF',
        logoSize: elements.logoSize?.value || '15'
    };
    
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
        console.warn('Failed to save preferences:', error);
    }
}

function loadQRPreferences(elements) {
    try {
        const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
        if (!preferencesStr) return;
        
        const preferences = JSON.parse(preferencesStr);
        
        if (elements.fgColor) elements.fgColor.value = preferences.fgColor || '#000000';
        if (elements.bgColor) elements.bgColor.value = preferences.bgColor || '#FFFFFF';
        if (elements.sizeSlider) elements.sizeSlider.value = preferences.size || '256';
        if (elements.borderSize) elements.borderSize.value = preferences.borderSize || '5';
        if (elements.borderColor) elements.borderColor.value = preferences.borderColor || '#FFFFFF';
        if (elements.logoSize) elements.logoSize.value = preferences.logoSize || '15';
        
        // Update UI
        updateSizeValue(elements);
        updateBorderSizeValue(elements);
        updateLogoSizeValue(elements);
        updateBorderPreview(elements);
        
    } catch (error) {
        console.warn('Failed to load preferences:', error);
    }
}

// Cleanup
function cleanup() {
    stopScanner();
    
    // Clean up images
    AppState.logoImage = null;
    AppState.bulkLogoImage = null;
    AppState.generatedQR = null;
    AppState.bulkQRs = [];
    AppState.isGenerating = false;
}

// Error Handler
class QRErrorHandler {
    static handle(error, context = 'QR Generation') {
        console.error(`${context} Error:`, error);
        
        const message = this.getUserFriendlyMessage(error);
        this.showToast(message, 'error');
    }
    
    static getUserFriendlyMessage(error) {
        const messages = {
            'NetworkError': 'Please check your internet connection',
            'SecurityError': 'Camera access denied. Please check permissions',
            'NotFoundError': 'Camera not found',
            'NotSupportedError': 'Feature not supported in your browser',
            'NotAllowedError': 'Camera access denied by user'
        };
        
        return messages[error.name] || error.message || 'An unexpected error occurred';
    }
    
    static showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
}

// Make functions globally available for HTML onclick attributes
window.generateQR = () => generateQR(globalElements);
window.downloadQR = () => downloadQR(globalElements);
window.generateBulkQR = () => generateBulkQR(globalElements);
window.useScannedContent = useScannedContent;
