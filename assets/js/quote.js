// quote.js - Quote request and contact form submission handler
(function () {
    'use strict';

    async function handleQuoteSubmit(event) {
        const form = event.target;
        if (!form.hasAttribute('data-quote-form') && !form.closest('.form-card')) return;

        event.preventDefault();

        const invalid = [...form.querySelectorAll('[required]')].filter(field => {
            const empty = !String(field.value || '').trim();
            field.classList.toggle('is-invalid', empty);
            return empty;
        });

        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const isQuoteForm = form.hasAttribute('data-quote-form') || window.location.pathname.includes('quote');
        const endpoint = isQuoteForm ? '/api/quote' : '/api/contact';

        let status = form.querySelector('.form-status');
        if (!status) {
            status = document.createElement('p');
            status.className = 'form-status';
            form.appendChild(status);
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resData = await response.json();
            form.reset();
            status.textContent = resData.message || 'Thanks. Your request has been send our team shortly contact you.';
        } catch (err) {
            console.error('Submission error:', err);
            form.reset();
            status.textContent = 'Thanks. Your request has been send our team shortly contact you.';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const quoteForm = document.querySelector('[data-quote-form]');
            if (quoteForm) {
                quoteForm.addEventListener('submit', handleQuoteSubmit);
            }
        });
    } else {
        const quoteForm = document.querySelector('[data-quote-form]');
        if (quoteForm) {
            quoteForm.addEventListener('submit', handleQuoteSubmit);
        }
    }
})();
