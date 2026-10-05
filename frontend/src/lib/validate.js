export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim())
export const isPhone = v => /^(\+91[\s-]?)?[6-9]\d{9}$/.test((v || '').replace(/\s/g, ''))
export const isPin = v => /^[1-9]\d{5}$/.test(v || '')
export const passwordChecks = pw => [
  ['At least 8 characters', pw.length >= 8], ['An uppercase letter', /[A-Z]/.test(pw)], ['A lowercase letter', /[a-z]/.test(pw)],
  ['A number', /\d/.test(pw)], ['A special character', /[^A-Za-z0-9]/.test(pw)]]
export const passwordOk = pw => passwordChecks(pw).every(([, ok]) => ok)
