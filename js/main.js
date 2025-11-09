// Constants
const PREFERENCES_KEY = 'qrPreferences';

// DOM Elements
let qrType, qrInput, vcardName, vcardPhone, vcardEmail, wifiSsid, wifiPassword, wifiType;
let smsPhone, smsMessage, emailAddress, emailSubject, emailBody, qrCanvas, fgColor, bgColor;
let transparentBg, bulkTransparentBg, sizeSlider, sizeValue, borderSize, borderSizeValue;
let borderColor, logoSize, logoSizeValue, bulkLogoSize, bulkLogoSizeValue, logoUpload;
let logoUploadArea, logoPreview, qrLoading, qrError, qrSuccess, downloadBtn, video;
let scanResult, startScanBtn, stopScanBtn, scannerOverlay, tabs, tabContents, bulkInput;
let bulkFileUpload, bulkFilename, bulkLoading, bulkProgress, bulkSuccess, bulkError;
let fileUpload, bulkFgColor, bulkBgColor, bulkSizeSlider, bulkSizeValue, bulkBorderSize;
let bulkBorderSizeValue, bulkBorderColor, bulkLogoUpload, bulkLogoUploadArea, bulkLogoPreview;
let bulkInputType, bulkListFields, bulkRangeFields, rangeStart, rangeEnd, rangePrefix;
let rangeSuffix, borderPreview, bulkBorderPreview, scannerStatus, scannerGuides;

// Global variables
let currentStream = null;
let logoImage = null;
let bulkLogoImage = null;
let generatedQR = null;
let bulkQRs = [];
let previewTimeout = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    updateSizeValue();
    updateBorderSizeValue();
    updateLogoSizeValue();
    updateBulkLogoSizeValue();
    updateBorderPreview();
    updateBulkBorderPreview();
    setupEventListeners();
    toggleQRTypeFields();
    initBulkInputType();
    loadQRPreferences();
});

function initializeDOMElements() {
    qrType = document.getElementById('qr-type');
    qrInput = document.getElementById('qr-input');
    vcardName = document.getElementById('vcard-name');
    vcardPhone = document.getElementById('vcard-phone');
    vcardEmail = document.getElementById('vcard-email');
    wifiSsid = document.getElementById('wifi-ssid');
    wifiPassword = document.getElementById('wifi-password');
    wifiType = document.getElementById('wifi-type');
    smsPhone = document.getElementById('sms-phone');
    smsMessage = document.getElementById('sms-message');
    emailAddress = document.getElementById('email-address');
    emailSubject = document.getElementById('email-subject');
    emailBody = document.getElementById('email-body');
    qrCanvas = document.getElementById('qr-canvas');
    fgColor = document.getElementById('fg-color');
    bgColor = document.getElementById('bg-color');
    transparentBg = document.getElementById('transparent-bg');
    bulkTransparentBg = document.getElementById('bulk-transparent-bg');
    sizeSlider = document.getElementById('size-slider');
    sizeValue = document.getElementById('size-value');
    borderSize = document.getElementById('border-size');
    borderSizeValue = document.getElementById('border-size-value');
    borderColor = document.getElementById('border-color');
    logoSize = document.getElementById('logo-size');
    logoSizeValue = document.getElementById('logo-size-value');
    bulkLogoSize = document.getElementById('bulk-logo-size');
    bulkLogoSizeValue = document.getElementById('bulk-logo-size-value');
    logoUpload = document.getElementById('logo-upload');
    logoUploadArea = document.getElementById('logo-upload-area');
    logoPreview = document.getElementById('logo-preview');
    qrLoading = document.getElementById('qr-loading');
    qrError = document.getElementById('qr-error');
    qrSuccess = document.getElementById('qr-success');
    downloadBtn = document.getElementById('download-btn');
    video = document.getElementById('scanner-video');
    scanResult = document.getElementById('scan-result');
    startScanBtn = document.getElementById('start-scan');
    stopScanBtn = document.getElementById('stop-scan');
    scannerOverlay = document.getElementById('scanner-overlay');
    tabs = document.querySelectorAll('.tab');
    tabContents = document.querySelectorAll('.tab-content');
    bulkInput = document.getElementById('bulk-input');
    bulkFileUpload = document.getElementById('bulk-file-upload');
    bulkFilename = document.getElementById('bulk-filename');
    bulkLoading = document.getElementById('bulk-loading');
    bulkProgress = document.getElementById('bulk-progress');
    bulkSuccess = document.getElementById('bulk-success');
    bulkError = document.getElementById('bulk-error');
    fileUpload = document.getElementById('file-upload');
    bulkFgColor = document.getElementById('bulk-fg-color');
    bulkBgColor = document.getElementById('bulk-bg-color');
    bulkSizeSlider = document.getElementById('bulk-size-slider');
    bulkSizeValue = document.getElementById('bulk-size-value');
    bulkBorderSize = document.getElementById('bulk-border-size');
    bulkBorderSizeValue = document.getElementById('bulk-border-size-value');
    bulkBorderColor = document.getElementById('bulk-border-color');
    bulkLogoUpload = document.getElementById('bulk-logo-upload');
    bulkLogoUploadArea = document.getElementById('bulk-logo-upload-area');
    bulkLogoPreview = document.getElementById('bulk-logo-preview');
    bulkInputType = document.getElementById('bulk-input-type');
    bulkListFields = document.getElementById('bulk-list-fields');
    bulkRangeFields = document.getElementById('bulk-range-fields');
    rangeStart = document.getElementById('range-start');
    rangeEnd = document.getElementById('range-end');
    rangePrefix = document.getElementById('range-prefix');
    rangeSuffix = document.getElementById('range-suffix');
    borderPreview = document.getElementById('border-preview');
    bulkBorderPreview = document.getElementById('bulk-border-preview');
    scannerStatus = document.getElementById('scanner-status');
    scannerGuides = document.getElementById('scanner-guides');
}

function initBulkInputType() {
    const bulkTypeRadios = document.querySelectorAll('input[name="bulk-type"]');
    const bulkInputLabels = document.querySelectorAll('#bulk-input-type label');
   
    function updateActiveState() {
        bulkInputLabels.forEach(label => label.classList.remove('active'));
       
        const checkedRadio = document.querySelector('input[name="bulk-type"]:checked');
        if (checkedRadio) {
            checkedRadio.closest('label').classList.add('active');
        }
    }
   
    updateActiveState();
   
    bulkTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateActiveState();
           
            bulkListFields.style.display = 'none';
            bulkRangeFields.style.display = 'none';
           
            if (radio.value === 'list') {
                bulkListFields.style.display = 'block';
            } else if (radio.value === 'range') {
                bulkRangeFields.style.display = 'block';
            }
        });
    });
}

// Set up all event listeners
function setupEventListeners() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
           
            if (currentStream) stopScanner();
        });
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });

    if (sizeSlider) sizeSlider.addEventListener('input', updateSizeValue);
   
    if (borderSize) borderSize.addEventListener('input', () => {
        updateBorderSizeValue();
        updateBorderPreview();
    });
   
    if (borderColor) borderColor.addEventListener('input', updateBorderPreview);
   
    if (logoSize) logoSize.addEventListener('input', updateLogoSizeValue);
   
    if (bulkLogoSize) bulkLogoSize.addEventListener('input', updateBulkLogoSizeValue);
   
    if (bulkSizeSlider) bulkSizeSlider.addEventListener('input', () => {
        bulkSizeValue.textContent = `${bulkSizeSlider.value}px`;
    });
   
    if (bulkBorderSize) bulkBorderSize.addEventListener('input', () => {
        bulkBorderSizeValue.textContent = `${bulkBorderSize.value}px`;
        updateBulkBorderPreview();
    });
   
    if (bulkBorderColor) bulkBorderColor.addEventListener('input', updateBulkBorderPreview);
    if (fgColor) fgColor.addEventListener('change', saveQRPreferences);
    if (bgColor) bgColor.addEventListener('change', saveQRPreferences);
    if (logoUploadArea) logoUploadArea.addEventListener('click', () => logoUpload.click());
    if (logoUpload) logoUpload.addEventListener('change', handleLogoUpload);
   
    if (bulkLogoUploadArea) bulkLogoUploadArea.addEventListener('click', () => bulkLogoUpload.click());
    if (bulkLogoUpload) bulkLogoUpload.addEventListener('change', handleBulkLogoUpload);
   
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        if (logoUploadArea) logoUploadArea.addEventListener(eventName, preventDefaults, false);
        if (bulkLogoUploadArea) bulkLogoUploadArea.addEventListener(eventName, preventDefaults, false);
    });
   
    ['dragenter', 'dragover'].forEach(eventName => {
        if (logoUploadArea) logoUploadArea.addEventListener(eventName, highlight, false);
        if (bulkLogoUploadArea) bulkLogoUploadArea.addEventListener(eventName, highlight, false);
    });
   
    ['dragleave', 'drop'].forEach(eventName => {
        if (logoUploadArea) logoUploadArea.addEventListener(eventName, unhighlight, false);
        if (bulkLogoUploadArea) bulkLogoUploadArea.addEventListener(eventName, unhighlight, false);
    });
   
    if (logoUploadArea) logoUploadArea.addEventListener('drop', handleDrop, false);
    if (bulkLogoUploadArea) bulkLogoUploadArea.addEventListener('drop', handleBulkDrop, false);
    if (qrInput) qrInput.addEventListener('blur', autoFormatURL);
    if (qrInput) qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') generateQRCode();
    });
    if (qrType) qrType.addEventListener('change', toggleQRTypeFields);
    if (startScanBtn) startScanBtn.addEventListener('click', startScanner);
    if (stopScanBtn) stopScanBtn.addEventListener('click', stopScanner);
    if (fileUpload) fileUpload.addEventListener('change', handleFileUpload);
    if (bulkFileUpload) bulkFileUpload.addEventListener('change', handleBulkFileUpload);
   
    // Cookie consent
    const acceptCookies = document.getElementById('accept-cookies');
    const rejectCookies = document.getElementById('reject-cookies');
    const openSettings = document.getElementById('open-settings');
    const closeSettings = document.querySelector('.close-settings');
    const saveSettings = document.getElementById('save-settings');
    const openSettingsFooter = document.getElementById('open-settings-footer');
   
    if (acceptCookies) acceptCookies.addEventListener('click', function() {
        document.getElementById('cookie-consent').style.display = 'none';
    });
   
    if (rejectCookies) rejectCookies.addEventListener('click', function() {
        document.getElementById('cookie-consent').style.display = 'none';
    });
   
    if (openSettings) openSettings.addEventListener('click', openCookieSettings);
    if (closeSettings) closeSettings.addEventListener('click', closeCookieSettings);
    if (saveSettings) saveSettings.addEventListener('click', function() {
        closeCookieSettings();
        document.getElementById('cookie-consent').style.display = 'none';
    });
   
    if (openSettingsFooter) openSettingsFooter.addEventListener('click', function(e) {
        e.preventDefault();
        openCookieSettings();
    });
}

function updateBorderPreview() {
    if (!borderPreview) return;
   
    const borderSizeVal = parseInt(borderSize.value);
    const borderColorVal = borderColor.value;
   
    if (borderSizeVal > 0) {
        borderPreview.style.border = `${borderSizeVal}px solid ${borderColorVal}`;
        if (logoUploadArea) logoUploadArea.classList.add('border-active');
    } else {
        borderPreview.style.border = 'none';
        if (logoUploadArea) logoUploadArea.classList.remove('border-active');
    }
}

function updateBulkBorderPreview() {
    if (!bulkBorderPreview) return;
   
    const borderSizeVal = parseInt(bulkBorderSize.value);
    const borderColorVal = bulkBorderColor.value;
   
    if (borderSizeVal > 0) {
        bulkBorderPreview.style.border = `${borderSizeVal}px solid ${borderColorVal}`;
        if (bulkLogoUploadArea) bulkLogoUploadArea.classList.add('border-active');
    } else {
        bulkBorderPreview.style.border = 'none';
        if (bulkLogoUploadArea) bulkLogoUploadArea.classList.remove('border-active');
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    this.classList.add('drag-over');
}

function unhighlight() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        logoUpload.files = files;
        handleLogoUpload({ target: { files } });
    }
}

function handleBulkDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        bulkLogoUpload.files = files;
        handleBulkLogoUpload({ target: { files } });
    }
}

function updateSizeValue() {
    if (sizeValue && sizeSlider) {
        sizeValue.textContent = `${sizeSlider.value}px`;
    }
}

function updateBorderSizeValue() {
    if (borderSizeValue && borderSize) {
        borderSizeValue.textContent = `${borderSize.value}px`;
    }
}

function updateLogoSizeValue() {
    if (logoSizeValue && logoSize) {
        logoSizeValue.textContent = `${logoSize.value}%`;
    }
}

function updateBulkLogoSizeValue() {
    if (bulkLogoSizeValue && bulkLogoSize) {
        bulkLogoSizeValue.textContent = `${bulkLogoSize.value}%`;
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
        showError(qrError, 'Please upload a valid image file');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        logoImage = new Image();
        logoImage.onload = function() {
            if (logoPreview) {
                logoPreview.innerHTML = '';
                const previewContainer = document.createElement('div');
                previewContainer.className = 'border-preview';
               
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Uploaded logo';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
               
                const borderIndicator = document.createElement('div');
                borderIndicator.className = 'border-indicator';
                borderIndicator.id = 'border-preview';
               
                previewContainer.appendChild(img);
                previewContainer.appendChild(borderIndicator);
                logoPreview.appendChild(previewContainer);
            }
           
            updateBorderPreview();
        };
        logoImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleBulkLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
        showError(bulkError, 'Please upload a valid image file');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        bulkLogoImage = new Image();
        bulkLogoImage.onload = function() {
            if (bulkLogoPreview) {
                bulkLogoPreview.innerHTML = '';
                const previewContainer = document.createElement('div');
                previewContainer.className = 'border-preview';
               
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Uploaded logo for bulk';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
               
                const borderIndicator = document.createElement('div');
                borderIndicator.className = 'border-indicator';
                borderIndicator.id = 'bulk-border-preview';
               
                previewContainer.appendChild(img);
                previewContainer.appendChild(borderIndicator);
                bulkLogoPreview.appendChild(previewContainer);
            }
           
            updateBulkBorderPreview();
        };
        bulkLogoImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function autoFormatURL() {
    const input = qrInput.value.trim();
    if (!input) return;
    if (input.includes('.') && !input.startsWith('http://') && !input.startsWith('https://')) {
        qrInput.value = `https://${input}`;
    }
}

function toggleQRTypeFields() {
    const type = qrType.value;
    document.querySelectorAll('.qr-type-fields').forEach(field => field.classList.remove('active'));
    const targetFields = document.getElementById(`${type}-fields`);
    if (targetFields) {
        targetFields.classList.add('active');
    }
}

function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9-]+$/g, '_').slice(0, 50);
}

// New modular functions
function getQRContent(type) {
    switch(type) {
        case 'url':
            const url = qrInput.value.trim();
            if (!url) throw new Error('URL is required');
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'http://' + url;
            }
            return url;
           
        case 'vcard':
            const name = vcardName.value.trim();
            const phone = vcardPhone.value.trim();
            const email = vcardEmail.value.trim();
           
            if (!name || !phone || !email) throw new Error('All vCard fields are required');
            if (!isValidEmail(email)) throw new Error('Invalid email format');
           
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
           
        case 'wifi':
            const ssid = wifiSsid.value.trim();
            const password = wifiPassword.value.trim();
            const encryption = wifiType.value;
           
            if (!ssid) throw new Error('Network name is required');
            if (encryption !== 'nopass' && !password) throw new Error('Password is required');
           
            return `WIFI:S:${ssid};T:${encryption};P:${password};;`;
           
        case 'email':
            const emailAddr = emailAddress.value.trim();
            const subject = emailSubject.value.trim();
            const body = emailBody.value.trim();
           
            if (!emailAddr) throw new Error('Email address is required');
            if (!isValidEmail(emailAddr)) throw new Error('Invalid email format');
           
            return `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
           
        default:
            const input = qrInput.value.trim();
            if (!input) throw new Error('Content is required');
            return input;
    }
}

function createQRCanvas(content, options) {
    return new Promise((resolve, reject) => {
        try {
            QRCode.toCanvas(content, {
                width: options.size,
                margin: 1,
                color: {
                    dark: options.fgColor,
                    light: options.bgColor
                },
                errorCorrectionLevel: 'H'
            }, (error, canvas) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(canvas);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function addLogoToQR(qrCanvas, logo, borderSize, borderColor, logoSizePercent) {
    return new Promise((resolve) => {
        if (!logo) {
            resolve(qrCanvas);
            return;
        }
       
        try {
            // Ensure logo doesn't break QR code scannability
            const maxSafeSize = qrCanvas.width * 0.25; // Max 25% of QR size
            const actualLogoSize = Math.min(
                qrCanvas.width * (logoSizePercent / 100),
                maxSafeSize
            );
           
            const ctx = qrCanvas.getContext('2d');
           
            // Draw border if border size is greater than 0
            if (borderSize > 0) {
                ctx.fillStyle = borderColor;
                const centerX = qrCanvas.width / 2;
                const centerY = qrCanvas.height / 2;
                const borderWidth = actualLogoSize + borderSize * 2;
               
                // Ensure border doesn't cover critical QR patterns
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
           
            resolve(qrCanvas);
        } catch (error) {
            console.error('Error adding logo to QR:', error);
            resolve(qrCanvas); // Resolve without logo if error occurs
        }
    });
}

// Fixed generateQR function - renamed to avoid recursion
async function generateQRCode() {
    try {
        const type = qrType.value;
        const content = getQRContent(type);
       
        const qrOptions = {
            size: parseInt(sizeSlider.value),
            fgColor: fgColor.value,
            bgColor: transparentBg.checked ? '#00000000' : bgColor.value
        };
       
        qrLoading.style.display = 'block';
        qrError.style.display = 'none';
        qrSuccess.style.display = 'none';
       
        // Create QR canvas
        const generatedCanvas = await createQRCanvas(content, qrOptions);
       
        // Add logo and border
        const finalCanvas = await addLogoToQR(
            generatedCanvas,
            logoImage,
            parseInt(borderSize.value),
            borderColor.value,
            parseInt(logoSize.value)
        );
       
        // Display results
        qrCanvas.width = finalCanvas.width;
        qrCanvas.height = finalCanvas.height;
        const ctx = qrCanvas.getContext('2d');
        ctx.drawImage(finalCanvas, 0, 0);
       
        generatedQR = { data: qrCanvas.toDataURL('image/png'), content };
       
        qrLoading.style.display = 'none';
        qrSuccess.style.display = 'block';
        qrSuccess.textContent = 'QR Code generated successfully!';
        downloadBtn.style.display = 'block';
        qrCanvas.style.display = 'block';
       
        // Test QR scannability
        testQRScannability(finalCanvas, content);
    } catch (error) {
        qrLoading.style.display = 'none';
        showError(qrError, error.message || 'Error generating QR code');
        console.error('QR generation error:', error);
    }
}

function testQRScannability(canvas, originalContent) {
    try {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
       
        if (!code) {
            qrSuccess.innerHTML += '<br><span class="scanner-error"><i class="fas fa-exclamation-circle"></i> Warning: QR code may be difficult to scan</span>';
        } else if (code.data !== originalContent) {
            qrSuccess.innerHTML += `<br><span class="scanner-error"><i class="fas fa-exclamation-circle"></i> Content mismatch: ${code.data.substr(0, 20)}...</span>`;
        } else {
            qrSuccess.innerHTML += '<br><span class="scanner-success"><i class="fas fa-check-circle"></i> QR code scans successfully</span>';
        }
    } catch (e) {
        console.log('QR test error:', e);
    }
}

// Updated bulk generation
async function generateBulkQR() {
    try {
        let inputs = [];
        const bulkType = document.querySelector('input[name="bulk-type"]:checked').value;
       
        if (bulkType === 'list') {
            // Check if a CSV file is uploaded
            if (bulkFileUpload.files.length) {
                const file = bulkFileUpload.files[0];
                const text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsText(file);
                });
               
                const results = Papa.parse(text, { header: true });
                if (results.errors.length) throw new Error('Error parsing CSV file');
               
                inputs = results.data.map(row => {
                    // Get the first non-empty value in the row
                    return Object.values(row).find(val => val && val.trim() !== '') || '';
                }).filter(val => val.trim() !== '');
            } else {
                inputs = bulkInput.value.trim().split('\n').filter(line => line.trim() !== '');
            }
        } else if (bulkType === 'range') {
            const start = parseInt(rangeStart.value);
            const end = parseInt(rangeEnd.value);
            const prefix = rangePrefix.value.trim();
            const suffix = rangeSuffix.value.trim();
           
            if (isNaN(start) || isNaN(end) || start > end) {
                throw new Error('Please enter valid start and end numbers');
            }
           
            if (end - start > 1000) {
                throw new Error('Range is too large (max 1000 items)');
            }
           
            for (let i = start; i <= end; i++) {
                inputs.push(`${prefix}${i}${suffix}`);
            }
        }
        if (inputs.length === 0) throw new Error('Please enter at least one item');
        if (inputs.length > 1000) throw new Error('For performance, limit to 1000 items at a time');
        bulkQRs = [];
        bulkSuccess.style.display = 'none';
        bulkError.style.display = 'none';
        bulkLoading.style.display = 'block';
        // Process in batches
        const batchSize = 5;
        for (let i = 0; i < inputs.length; i += batchSize) {
            const batch = inputs.slice(i, i + batchSize);
            await processBatch(batch, i, inputs.length);
        }
        createBulkZip();
    } catch (error) {
        bulkLoading.style.display = 'none';
        showError(bulkError, error.message || 'Error generating bulk QR codes');
        console.error('Bulk QR error:', error);
    }
}

async function processBatch(batch, startIndex, total) {
    for (let j = 0; j < batch.length; j++) {
        const index = startIndex + j;
        const input = batch[j];
        bulkProgress.textContent = `Generating QR codes: ${index + 1}/${total}`;
       
        try {
            const qrOptions = {
                size: parseInt(bulkSizeSlider.value),
                fgColor: bulkFgColor.value,
                bgColor: bulkTransparentBg.checked ? '#00000000' : bulkBgColor.value
            };
           
            // Create QR canvas
            const generatedCanvas = await createQRCanvas(input, qrOptions);
           
            // Add logo and border
            const finalCanvas = await addLogoToQR(
                generatedCanvas,
                bulkLogoImage,
                parseInt(bulkBorderSize.value),
                bulkBorderColor.value,
                parseInt(bulkLogoSize.value)
            );
           
            bulkQRs.push({
                content: input,
                dataURL: finalCanvas.toDataURL('image/png')
            });
        } catch (error) {
            console.error('Error generating QR code for: ' + input, error);
            // Add placeholder for failed generation
            bulkQRs.push({
                content: input,
                error: true,
                message: error.message || 'Failed to generate QR code'
            });
        }
    }
}

function createBulkZip() {
    try {
        const zip = new JSZip();
        const prefix = bulkFilename.value.trim() || 'qr-codes';
        let successCount = 0;
        for (const item of bulkQRs) {
            if (!item.error) {
                const filename = `${sanitizeFilename(item.content)}.png`;
                const data = item.dataURL.split(',')[1];
                zip.file(filename, data, { base64: true });
                successCount++;
            }
        }
        if (successCount === 0) {
            throw new Error('No QR codes were generated successfully');
        }
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, `${prefix}.zip`);
            bulkLoading.style.display = 'none';
            bulkSuccess.style.display = 'block';
            bulkSuccess.textContent = `Successfully generated and downloaded ${successCount} QR codes!`;
           
            if (successCount < bulkQRs.length) {
                bulkSuccess.textContent += ` (${bulkQRs.length - successCount} failed)`;
            }
        });
    } catch (error) {
        bulkLoading.style.display = 'none';
        showError(bulkError, error.message || 'Error creating ZIP file');
        console.error('ZIP creation error:', error);
    }
}

// Email validation function
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function downloadQR() {
    if (!generatedQR) {
        showError(qrError, 'Please generate a QR code first');
        return;
    }
    const filename = sanitizeFilename(generatedQR.content) + '.png';
    const a = document.createElement('a');
    a.href = generatedQR.data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function startScanner() {
    scannerOverlay.style.display = 'flex';
    scanResult.innerHTML = '<p>Scanning... Point camera at QR code</p>';
    updateScannerStatus('Scanning...', 'scanner-loading');
   
    // Add scanning guides
    scannerGuides.innerHTML = `
        <div class="guide-line horizontal" style="top: 33%"></div>
        <div class="guide-line horizontal" style="top: 66%"></div>
        <div class="guide-line vertical" style="left: 33%"></div>
        <div class="guide-line vertical" style="left: 66%"></div>
    `;
    scannerGuides.style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
            requestAnimationFrame(scanQR);
        })
        .catch(err => {
            console.error('Camera error: ', err);
            scanResult.innerHTML = `<p class="error">Error accessing camera: ${err.message}</p>`;
            updateScannerStatus('Camera Error', 'scanner-error');
        });
}

function updateScannerStatus(message, className) {
    scannerStatus.textContent = message;
    scannerStatus.className = `scanner-status ${className}`;
    scannerStatus.style.display = 'block';
}

function stopScanner() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    scannerOverlay.style.display = 'none';
   
    // Remove scanning guides
    scannerGuides.style.display = 'none';
   
    // Hide status
    scannerStatus.style.display = 'none';
}

function scanQR() {
    if (!currentStream) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
            scanResult.innerHTML = `
                <p><strong>QR Code detected!</strong></p>
                <p><strong>Content:</strong> ${code.data}</p>
                <button onclick="useScannedContent('${code.data.replace(/'/g, "\\'")}')">
                    Generate this QR
                </button>
            `;
            updateScannerStatus('QR Code Detected!', 'scanner-success');
        }
    }
    requestAnimationFrame(scanQR);
}

function useScannedContent(content) {
    stopScanner();
    qrType.value = 'url';
    toggleQRTypeFields();
    qrInput.value = content;
    if (tabs.length > 0) tabs[0].click();
    generateQRCode();
}

function scanQRFromImage(img) {
    updateScannerStatus('Processing image...', 'scanner-loading');
   
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, canvas.height);
    if (code) {
        scanResult.innerHTML = `
            <p><strong>QR Code detected in image!</strong></p>
            <p><strong>Content:</strong> ${code.data}</p>
            <button onclick="useScannedContent('${code.data.replace(/'/g, "\\'")}')">
                Generate this QR
            </button>
        `;
        updateScannerStatus('QR Code Found!', 'scanner-success');
    } else {
        scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> No QR code found in the image</p>';
        updateScannerStatus('No QR Found', 'scanner-error');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
   
    if (!file.type.match('image.*')) {
        scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> Please upload a valid image file</p>';
        updateScannerStatus('Invalid File', 'scanner-error');
        return;
    }
    updateScannerStatus('Processing image...', 'scanner-loading');
   
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            scanQRFromImage(img);
        };
        img.onerror = function() {
            scanResult.innerHTML = '<p class="error"><i class="fas fa-exclamation-circle"></i> Error loading image</p>';
            updateScannerStatus('Image Error', 'scanner-error');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleBulkFileUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
        showError(bulkError, 'Please upload a valid CSV file');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        bulkInput.value = lines.join('\n');
    };
    reader.readAsText(file);
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function saveQRPreferences() {
    const preferences = {
        fgColor: fgColor.value,
        bgColor: bgColor.value,
        size: sizeSlider.value,
        borderSize: borderSize.value,
        borderColor: borderColor.value,
        logoSize: logoSize.value
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

function loadQRPreferences() {
    const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
    if (preferencesStr) {
        try {
            const preferences = JSON.parse(preferencesStr);
           
            if (fgColor) fgColor.value = preferences.fgColor || '#000000';
            if (bgColor) bgColor.value = preferences.bgColor || '#FFFFFF';
           
            if (sizeSlider) {
                sizeSlider.value = preferences.size || '256';
            }
           
            if (borderSize) {
                borderSize.value = preferences.borderSize || '5';
            }
           
            if (borderColor) borderColor.value = preferences.borderColor || '#FFFFFF';
           
            if (logoSize) {
                logoSize.value = preferences.logoSize || '15';
            }
        } catch (e) {
            console.error('Failed to parse QR preferences:', e);
        }
    }
}

// Missing function implementations
function openCookieSettings() {
    const settingsModal = document.getElementById('cookie-settings');
    if (settingsModal) {
        settingsModal.style.display = 'block';
    }
}

function closeCookieSettings() {
    const settingsModal = document.getElementById('cookie-settings');
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
}

// Make functions globally available for HTML onclick attributes
window.generateQR = generateQRCode;
window.generateBulkQR = generateBulkQR;
window.downloadQR = downloadQR;
window.useScannedContent = useScannedContent;
