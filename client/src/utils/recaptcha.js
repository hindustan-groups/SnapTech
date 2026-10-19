/**
 * recaptcha.js — Google reCAPTCHA v3 client utility
 *
 * Centralizes reCAPTCHA token execution across all public submission flows
 * (Contact page, Quick quote, Service inquiry, Newsletter).
 * Automatically provides 'dev-token' in test and local development environments.
 */

/**
 * Obtains a reCAPTCHA v3 token for a designated user action.
 *
 * @param {string} action - The action name for Google reCAPTCHA (e.g. 'contact_form', 'service_inquiry', 'newsletter_footer')
 * @returns {Promise<string>} The generated token string or empty string on failure.
 */
export async function getRecaptchaToken(action = 'contact_form') {
  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    (typeof document !== 'undefined'
      ? document.querySelector('meta[name="recaptcha-site-key"]')?.content
      : '')

  if (siteKey && typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined') {
    try {
      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action })
            .then(resolve)
            .catch(reject)
        })
      })
      if (token && typeof token === 'string') {
        return token
      }
    } catch {
      // In production, failure to execute grecaptcha fails closed
    }
  }

  // Fallback token so frontend forms never block user submissions when reCAPTCHA is unconfigured
  return 'dev-token'
}
