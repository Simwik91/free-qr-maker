# Enhanced QR Code Generator

This project is a free, browser-based QR Code Generator that allows users to create custom QR codes with various features, including logo embedding, color customization, and support for different QR code types. It also includes a QR code scanner.

## Features

-   **Custom Design**: Create QR codes with custom colors and embedded logos for brand recognition.
-   **Bulk Generation**: Generate multiple QR codes at once, including sequential numbers or from a list/CSV file.
-   **QR Scanner**: Scan any QR code using your device's camera or by uploading an image.
-   **Multiple QR Types**: Supports text, vCard (contact), Wi-Fi, SMS, and Email QR codes.
-   **Privacy First**: All processing happens in your browser - no data is uploaded to servers.

## Usage

1.  Open `index.html` in a web browser.
2.  Select a tab: "Single QR Code", "Bulk QR Codes", or "Scan QR Code".
3.  **Single QR Code**:
    -   Choose the QR code type and enter content.
    -   Optionally upload a logo and customize its size, border, and color.
    -   Set foreground and background colors, and adjust the QR code size.
    -   Click "Generate QR Code" and then "Download QR Code".
4.  **Bulk QR Codes**:
    -   Choose between list input (one item per line) or number range generation.
    -   Optionally upload a CSV file for list input.
    -   Customize design options similar to single QR codes.
    -   Click "Generate & Download as ZIP".
5.  **Scan QR Code**:
    -   Click "Start Camera Scanner" or upload an image file containing a QR code.
    -   The decoded content will appear in the "Scan results" area.

## Third-Party Libraries and Licenses

This project uses the following open-source libraries:

-   **qrcode**: QR code generation library.
    -   License: MIT License
    -   Source: [https://github.com/soldair/node-qrcode](https://github.com/soldair/node-qrcode)
-   **jszip**: For creating ZIP files for bulk downloads.
    -   License: MIT License
    -   Source: [https://github.com/Stuk/jszip](https://github.com/Stuk/jszip)
-   **FileSaver.js**: For saving generated files.
    -   License: MIT License
    -   Source: [https://github.com/eligrey/FileSaver.js](https://github.com/eligrey/FileSaver.js)
-   **jsQR**: A pure JavaScript QR code reading library.
    -   License: Apache License 2.0
    -   Source: [https://github.com/cozmo/jsQR](https://github.com/cozmo/jsQR)
-   **papaparse**: A powerful CSV parser for JavaScript.
    -   License: MIT License

## Support

This project is supported by "Buy Me a Coffee".

---

© 2025 Free QR Maker