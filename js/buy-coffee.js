// js/bmc.js
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.bmcInitialized) return;
  window.bmcInitialized = true;

  const BMC = {
    popup: null,
    floating: null,
    closeBtn: null,

    init() {
      this.popup = document.getElementById('bmc-popup');
      this.floating = document.getElementById('bmc-floating');
      this.closeBtn = document.getElementById('bmc-popup-close');

      if (!this.popup || !this.floating) {
        console.warn('BMC: Required elements not found. Is the include loaded?');
        return;
      }

      this.bindEvents();
      this.maybeShowPopup();
    },

    bindEvents() {
      this.closeBtn?.addEventListener('click', () => {
        this.hidePopup();
        this.showFloatingButton();
      });

      this.popup.addEventListener('click', (e) => {
        if (e.target === this.popup) {
          this.hidePopup();
          this.showFloatingButton();
        }
      });
    },

    maybeShowPopup() {
      if (!sessionStorage.getItem('bmcPopupShown')) {
        setTimeout(() => {
          this.popup.style.display = 'flex';
          sessionStorage.setItem('bmcPopupShown', 'true');
        }, 1500);
      } else {
        setTimeout(() => this.showFloatingButton(), 1000);
      }
    },

    hidePopup() {
      this.popup.style.display = 'none';
    },

    showFloatingButton() {
      if (this.floating.innerHTML.trim()) return;

      const btn = document.createElement('a');
      btn.href = 'https://buymeacoffee.com/simwik91';
      btn.target = '_blank';
      btn.className = 'centered-floating-bmc-btn';
      btn.innerHTML = `
        <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Coffee cup">
        Buy me a coffee
      `;
      btn.title = 'Support my work';

      this.floating.appendChild(btn);
      this.floating.style.display = 'block';
    }
  };

  // Expose globally
  window.BMC = BMC;

  // Optional: Auto-init if elements already exist (for static includes)
  if (document.getElementById('bmc-popup')) {
    BMC.init();
  }
})();
