/**
 * Simpleton Secure Widget v3.2
 * Production-ready secure precious metals calculator widget
 * Security hardened for deployment
 */

(function() {
    'use strict';

    // Security-hardened configuration
    const SECURE_CONFIG = {
        apiBaseUrl: (function() {
            const origin = window.location.origin;
            const hostname = window.location.hostname;
            const allowedDomains = [
                'localhost',
                '127.0.0.1',
                'replit.app',
                'replit.dev',
                'simpletonapp.com'
            ];
            const isAllowed = allowedDomains.some(domain =>
                hostname === domain || hostname.endsWith('.' + domain)
            );
            return isAllowed ? origin : 'https://simpletonapp.com';
        })(),
        version: '3.2.0',
        maxCalculationValue: 1000000,
        rateLimitRequests: 10,
        inputSanitization: true
    };

    // Secure HTML template
    const SECURE_HTML = `
        <div class="simpleton-secure-widget" data-version="${SECURE_CONFIG.version}">
            <div class="widget-header">
                <div class="header-content">
                    <div class="logo-wrapper">
                        <svg class="widget-logo" viewBox="0 0 24 24" aria-label="Simpleton Calculator">
                            <circle cx="12" cy="12" r="10" stroke="#FFD700" stroke-width="1.5" fill="none"/>
                            <path d="M8 12h8M12 8v8" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="brand-section">
                        <h2 class="widget-title">Simpleton Calculator</h2>
                        <span class="widget-version">Secure v${SECURE_CONFIG.version}</span>
                    </div>
                </div>
                <div class="security-indicator">
                    <span class="security-badge" title="Security Verified">🔒</span>
                </div>
            </div>

            <div class="widget-content">
                <form class="calculation-form" id="secure-form" novalidate>
                    <div class="input-section">
                        <div class="input-group">
                            <label for="secure-weight" class="input-label">
                                Weight <span class="required">*</span>
                            </label>
                            <div class="input-wrapper">
                                <input
                                    type="number"
                                    id="secure-weight"
                                    class="secure-input"
                                    placeholder="0.00"
                                    min="0"
                                    max="10000"
                                    step="0.001"
                                    required
                                    autocomplete="off"
                                    inputmode="decimal"
                                    aria-describedby="weight-help"
                                >
                                <select id="secure-unit" class="secure-select" required>
                                    <option value="">Unit</option>
                                    <option value="grams">Grams (g)</option>
                                    <option value="ounces">Ounces (oz)</option>
                                    <option value="troy-ounces">Troy Oz (tr oz)</option>
                                </select>
                            </div>
                            <small id="weight-help" class="input-help">Enter weight between 0–10,000</small>
                        </div>

                        <div class="input-group">
                            <label for="secure-metal" class="input-label">
                                Precious Metal <span class="required">*</span>
                            </label>
                            <select id="secure-metal" class="secure-select full-width" required>
                                <option value="">Select metal</option>
                                <option value="gold">Gold</option>
                                <option value="silver">Silver</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label for="secure-purity" class="input-label">
                                Purity Grade <span class="required">*</span>
                            </label>
                            <select id="secure-purity" class="secure-select full-width" required>
                                <option value="">Select purity</option>
                                <optgroup label="Gold Karats">
                                    <option value="99.9">24K (99.9% Pure)</option>
                                    <option value="91.7">22K (91.7% Pure)</option>
                                    <option value="75.0">18K (75.0% Pure)</option>
                                    <option value="58.3">14K (58.3% Pure)</option>
                                    <option value="41.7">10K (41.7% Pure)</option>
                                </optgroup>
                                <optgroup label="Silver Standards">
                                    <option value="99.9">Fine Silver (99.9%)</option>
                                    <option value="92.5">Sterling Silver (92.5%)</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <button type="submit" id="secure-calculate" class="calculate-button">
                        <span class="button-text">Calculate Value</span>
                        <span class="button-loader" style="display:none;">⏳</span>
                    </button>
                </form>

                <div id="secure-results" class="results-section" style="display:none;">
                    <div class="results-header">
                        <h3 class="results-title">Calculation Result</h3>
                        <div class="timestamp" id="calc-timestamp"></div>
                    </div>
                    <div class="result-display">
                        <div class="primary-value">
                            $<span id="total-value">0.00</span>
                        </div>
                        <div class="result-breakdown">
                            <div class="breakdown-item">
                                <span class="label">Pure Metal Weight:</span>
                                <span id="pure-weight" class="value">0.00g</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Current Spot Price:</span>
                                <span id="spot-price" class="value">$0.00/oz</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Price Per Gram:</span>
                                <span id="price-per-gram" class="value">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="error-display" class="error-section" style="display:none;">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message" id="error-text"></div>
                </div>
            </div>

            <div class="widget-footer">
                <div class="footer-info">
                    <a href="${SECURE_CONFIG.apiBaseUrl}" target="_blank" rel="noopener noreferrer" class="brand-link">
                        Powered by Simpleton Vision™
                    </a>
                    <span class="security-note">🔒 Secure &amp; Verified</span>
                </div>
            </div>
        </div>
    `;

    // Gold/dark theme CSS
    const SECURE_CSS = `
        .simpleton-secure-widget {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 420px;
            background: #0a0a14;
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,215,0,0.06);
            overflow: hidden;
            position: relative;
        }

        .widget-header {
            background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
            border-bottom: 1px solid rgba(255, 215, 0, 0.15);
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .widget-logo {
            width: 32px;
            height: 32px;
        }

        .widget-title {
            font-size: 17px;
            font-weight: 700;
            margin: 0;
            color: #FFD700;
            letter-spacing: -0.01em;
        }

        .widget-version {
            font-size: 11px;
            color: rgba(255, 215, 0, 0.5);
            display: block;
            margin-top: 1px;
        }

        .security-badge {
            font-size: 16px;
            filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.3));
        }

        .widget-content {
            padding: 24px;
            background: #0a0a14;
        }

        .input-section {
            display: flex;
            flex-direction: column;
            gap: 18px;
            margin-bottom: 22px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
        }

        .input-label {
            font-weight: 600;
            color: rgba(255, 215, 0, 0.8);
            font-size: 13px;
            letter-spacing: 0.02em;
        }

        .required {
            color: #ef4444;
        }

        .input-wrapper {
            display: flex;
            gap: 8px;
        }

        .secure-input,
        .secure-select {
            padding: 11px 14px;
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 8px;
            font-size: 15px;
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.9);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            -webkit-appearance: none;
            appearance: none;
        }

        .secure-select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 32px;
        }

        .secure-input {
            flex: 1;
        }

        .secure-select {
            min-width: 110px;
        }

        .secure-select.full-width {
            width: 100%;
            min-width: unset;
        }

        .secure-input::placeholder {
            color: rgba(255, 255, 255, 0.25);
        }

        .secure-input:focus,
        .secure-select:focus {
            outline: none;
            border-color: rgba(255, 215, 0, 0.5);
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.08);
        }

        .secure-select option,
        .secure-select optgroup {
            background: #1a1a2e;
            color: rgba(255, 255, 255, 0.9);
        }

        .input-help {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.3);
        }

        .calculate-button {
            width: 100%;
            padding: 15px 24px;
            background: linear-gradient(135deg, #FFD700 0%, #DAA520 100%);
            color: #0a0a14;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            letter-spacing: 0.01em;
        }

        .calculate-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 28px rgba(255, 215, 0, 0.3);
        }

        .calculate-button:active:not(:disabled) {
            transform: translateY(0);
        }

        .calculate-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .results-section {
            background: rgba(255, 215, 0, 0.03);
            border: 1px solid rgba(255, 215, 0, 0.1);
            border-radius: 12px;
            padding: 18px;
            margin-top: 18px;
        }

        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
        }

        .results-title {
            font-size: 14px;
            font-weight: 700;
            color: rgba(255, 215, 0, 0.7);
            margin: 0;
            letter-spacing: 0.03em;
            text-transform: uppercase;
        }

        .timestamp {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.3);
        }

        .primary-value {
            font-size: 36px;
            font-weight: 800;
            color: #FFD700;
            text-align: center;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
            font-variant-numeric: tabular-nums;
        }

        .result-breakdown {
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-top: 1px solid rgba(255, 215, 0, 0.08);
            padding-top: 12px;
        }

        .breakdown-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }

        .breakdown-item .label {
            color: rgba(255, 255, 255, 0.4);
        }

        .breakdown-item .value {
            font-weight: 600;
            color: rgba(255, 255, 255, 0.85);
            font-variant-numeric: tabular-nums;
        }

        .error-section {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 14px;
            margin-top: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .error-icon {
            font-size: 18px;
        }

        .error-message {
            color: #f87171;
            font-weight: 500;
            font-size: 14px;
        }

        .widget-footer {
            background: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(255, 215, 0, 0.08);
            padding: 11px 20px;
        }

        .footer-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .brand-link {
            color: rgba(255, 215, 0, 0.6);
            text-decoration: none;
            font-weight: 500;
            font-size: 12px;
            transition: color 0.2s;
        }

        .brand-link:hover {
            color: #FFD700;
        }

        .security-note {
            font-size: 11px;
            color: rgba(255, 215, 0, 0.4);
            font-weight: 500;
        }

        @media (max-width: 480px) {
            .simpleton-secure-widget {
                max-width: 100%;
                border-radius: 12px;
            }
            .input-wrapper {
                flex-direction: column;
            }
            .secure-select {
                min-width: auto;
            }
        }
    `;

    // Secure Widget Class
    class SecureSimpletonWidget {
        constructor(container, options = {}) {
            this.container = container;
            this.options = { ...SECURE_CONFIG, ...options };
            this.currentPrices = {};
            this.rateLimiter = new RateLimiter(this.options.rateLimitRequests);
            this.validator = new InputValidator();
            this.init();
        }

        async init() {
            try {
                this.injectSecureStyles();
                this.renderSecureWidget();
                this.bindSecureEvents();
                await this.loadSecurePrices();
            } catch (error) {
                this.handleError('Failed to initialize widget: ' + error.message);
            }
        }

        injectSecureStyles() {
            if (!document.getElementById('simpleton-secure-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'simpleton-secure-styles';
                styleEl.textContent = SECURE_CSS;
                document.head.appendChild(styleEl);
            }
        }

        renderSecureWidget() {
            this.container.innerHTML = '';
            this.container.insertAdjacentHTML('afterbegin', SECURE_HTML);
        }

        bindSecureEvents() {
            const form = this.container.querySelector('#secure-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleSecureSubmit(e));
            }
            const inputs = this.container.querySelectorAll('.secure-input, .secure-select');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.validateInput(input));
                input.addEventListener('blur', () => this.validateInput(input));
            });
        }

        async handleSecureSubmit(event) {
            event.preventDefault();
            if (!this.rateLimiter.allowRequest()) {
                this.showError('Too many requests. Please wait a moment.');
                return;
            }
            const formData = this.getFormData();
            const validation = this.validator.validateCalculation(formData);
            if (!validation.isValid) {
                this.showError(validation.error);
                return;
            }
            await this.performSecureCalculation(formData);
        }

        getFormData() {
            return {
                weight: this.container.querySelector('#secure-weight').value,
                unit: this.container.querySelector('#secure-unit').value,
                metal: this.container.querySelector('#secure-metal').value,
                purity: this.container.querySelector('#secure-purity').value
            };
        }

        validateInput(input) {
            const isValid = input.checkValidity();
            input.classList.toggle('invalid', !isValid);
            return isValid;
        }

        async performSecureCalculation(data) {
            try {
                this.showLoading(true);
                const weight = parseFloat(data.weight);
                const purity = parseFloat(data.purity);
                if (weight > this.options.maxCalculationValue) {
                    throw new Error('Weight value too large for calculation');
                }
                const weightInGrams = this.convertToGrams(weight, data.unit);
                const pureWeight = weightInGrams * (purity / 100);
                const spotPrice = this.currentPrices[data.metal] || 0;
                const pricePerGram = spotPrice / 31.1035;
                const totalValue = pureWeight * pricePerGram;
                this.displaySecureResults({ totalValue, pureWeight, spotPrice, pricePerGram });
            } catch (error) {
                this.handleError('Calculation failed: ' + error.message);
            } finally {
                this.showLoading(false);
            }
        }

        convertToGrams(weight, unit) {
            const conversions = {
                'grams': 1,
                'ounces': 28.3495,
                'troy-ounces': 31.1035
            };
            return weight * (conversions[unit] || 1);
        }

        displaySecureResults(data) {
            this.container.querySelector('#total-value').textContent = data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            this.container.querySelector('#pure-weight').textContent = `${data.pureWeight.toFixed(4)}g`;
            this.container.querySelector('#spot-price').textContent = `$${data.spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz`;
            this.container.querySelector('#price-per-gram').textContent = `$${data.pricePerGram.toFixed(4)}`;
            this.container.querySelector('#calc-timestamp').textContent = new Date().toLocaleString();
            this.container.querySelector('#secure-results').style.display = 'block';
            this.container.querySelector('#error-display').style.display = 'none';
        }

        async loadSecurePrices() {
            try {
                const response = await this.secureRequest('/api/pricing/latest');
                if (response.ok) {
                    const data = await response.json();
                    const prices = data.data || data;
                    // Handle array response [{metal:'Gold', price:...}] or object {gold:...}
                    if (Array.isArray(prices)) {
                        prices.forEach(item => {
                            const key = (item.metal || item.name || '').toLowerCase();
                            if (key === 'gold') this.currentPrices.gold = parseFloat(item.price || item.spotPrice || 0);
                            if (key === 'silver') this.currentPrices.silver = parseFloat(item.price || item.spotPrice || 0);
                            if (key === 'platinum') this.currentPrices.platinum = parseFloat(item.price || item.spotPrice || 0);
                        });
                    } else {
                        this.currentPrices = {
                            gold: parseFloat(prices.gold || 0),
                            silver: parseFloat(prices.silver || 0),
                            platinum: parseFloat(prices.platinum || 0)
                        };
                    }
                    // Validate sanity — if numbers look wrong, fall back
                    if (!this.currentPrices.gold || this.currentPrices.gold < 100) throw new Error('invalid price data');
                } else {
                    throw new Error('price fetch failed');
                }
            } catch (error) {
                console.warn('Simpleton Secure Widget: Using fallback prices (v3.2)');
                // Updated fallback prices — Feb 2026 market levels
                this.currentPrices = {
                    gold: 5185,
                    silver: 90,
                    platinum: 1010
                };
            }
        }

        async secureRequest(endpoint) {
            const url = `${this.options.apiBaseUrl}${endpoint}`;
            return fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }

        showLoading(show) {
            const button = this.container.querySelector('#secure-calculate');
            const text = button.querySelector('.button-text');
            const loader = button.querySelector('.button-loader');
            if (show) {
                text.style.display = 'none';
                loader.style.display = 'inline';
                button.disabled = true;
            } else {
                text.style.display = 'inline';
                loader.style.display = 'none';
                button.disabled = false;
            }
        }

        showError(message) {
            this.container.querySelector('#error-text').textContent = message;
            this.container.querySelector('#error-display').style.display = 'flex';
            this.container.querySelector('#secure-results').style.display = 'none';
        }

        handleError(message) {
            console.error('Simpleton Secure Widget Error:', message);
            this.showError('An error occurred. Please try again.');
        }
    }

    // Rate Limiter
    class RateLimiter {
        constructor(maxRequests = 10) {
            this.maxRequests = maxRequests;
            this.requests = [];
        }
        allowRequest() {
            const now = Date.now();
            this.requests = this.requests.filter(t => t > now - 60000);
            if (this.requests.length >= this.maxRequests) return false;
            this.requests.push(now);
            return true;
        }
    }

    // Input Validator
    class InputValidator {
        validateCalculation(data) {
            if (!data.weight || isNaN(parseFloat(data.weight)))
                return { isValid: false, error: 'Please enter a valid weight' };
            if (parseFloat(data.weight) <= 0 || parseFloat(data.weight) > 10000)
                return { isValid: false, error: 'Weight must be between 0 and 10,000' };
            if (!data.unit)
                return { isValid: false, error: 'Please select a weight unit' };
            if (!data.metal)
                return { isValid: false, error: 'Please select a metal type' };
            if (!data.purity || isNaN(parseFloat(data.purity)))
                return { isValid: false, error: 'Please select a purity grade' };
            return { isValid: true };
        }
    }

    // Auto-initialize
    function initializeSecureWidgets() {
        const widgets = document.querySelectorAll('[data-simpleton-secure-widget]');
        widgets.forEach(element => {
            try {
                new SecureSimpletonWidget(element);
            } catch (error) {
                console.error('Failed to initialize secure widget:', error);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecureWidgets);
    } else {
        initializeSecureWidgets();
    }

    if (typeof window !== 'undefined') {
        window.SecureSimpletonWidget = SecureSimpletonWidget;
    }

})();
