import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from '../i18n/en.js'
import ar from '../i18n/ar.js'

const STORAGE_KEY = 'ttx-lang'
const LOCALES = { en, ar }

const LocaleContext = createContext(null)

function interpolate(str, params) {
  return str.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`)
}

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en')

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
    const dir = l === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = l
  }, [])

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((key, params) => {
    const locale = LOCALES[lang] || en
    const val = locale[key]
    if (val === undefined) return key
    return params ? interpolate(val, params) : val
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en')
  }, [lang, setLang])

  return (
    <LocaleContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}