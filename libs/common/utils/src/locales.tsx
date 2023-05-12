import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from 'react'

import { Locale } from 'antd/lib/locale-provider'
import { merge }  from 'lodash'

import { get } from '@acx-ui/config'

import { setUpIntl } from './intlUtil'

type Message = string | NestedMessages
type NestedMessages = { [key: string]: Message }
export type Messages = Locale & Record<string, string>
export const DEFAULT_SYS_LANG: LangKey = 'en-US'

function flattenMessages (nestedMessages: NestedMessages, prefix = ''): Record<string, string> {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    let value = nestedMessages[key]
    let prefixedKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      messages[prefixedKey] = value
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey))
    }

    return messages
  }, {} as Record<string, string>)
}

export async function localePath (locale: string) {
  // This code is needed when GCS bucket is not configured / GCS is down or unavailable
  // Also this is a management ask till FF is set to ON, we default to en-US from local repo only
  // and not from GCS bucket.
  if (locale === DEFAULT_SYS_LANG) {
    const url = `locales/compiled/${locale}.json`
    return await fetch(url).then(res => res.json())
  }
  const gcs = get('STATIC_ASSETS')
  const myHeaders = new Headers()
  myHeaders.append('origin', 'window.origin')
  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  }
  const url = `${gcs}/locales/compiled/${locale}.json`
  try {
    const response = await fetch(url, requestOptions )
    if (!response.ok) {
      throw new Error(`Fetch response ${response.status}`)
    } else {
      const result = await response.json()
      return result
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching ${url}, error: ${err}`)
    return {}
  }
}

async function loadEnUS (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/en_US').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/en_US').then(result => result.default),
    localePath('en-US') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadDe (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/de_DE').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/de_DE').then(result => result.default),
    localePath('de-DE') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadJp (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/ja_JP').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/ja_JP').then(result => result.default),
    localePath('ja-JP') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadEs (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/es_ES').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/es_ES').then(result => result.default),
    localePath('es-ES') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadFr (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/fr_FR').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/fr_FR').then(result => result.default),
    localePath('fr-FR') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadKoKR (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/ko_KR').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/ko_KR').then(result => result.default),
    localePath('ko-KR') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadZhCN (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/zh_CN').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/zh_CN').then(result => result.default),
    localePath('zh-CN') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadPtBR (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/pt_BR').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/pt_BR').then(result => result.default),
    localePath('pt-BR') as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

export const localeLoaders = {
  'en-US': loadEnUS,
  'de-DE': loadDe,
  'ja-JP': loadJp,
  'es-ES': loadEs,
  'fr-FR': loadFr,
  'ko-KR': loadKoKR,
  'pt-BR': loadPtBR,
  'zh-CN': loadZhCN
}

const allowedLang = Object.keys(localeLoaders)
export type LangKey = keyof typeof localeLoaders
const cache: Partial<Record<LangKey, Messages>> = {}
export async function loadLocale (locale: LangKey, ignoreCache = false) {
  // fallback when browser detected or url param provided lang not supported
  locale = allowedLang.includes(locale) ? locale : DEFAULT_SYS_LANG
  const result = cache[locale]
  if (!ignoreCache && result) { return result }

  cache[locale] = await localeLoaders[locale]()
  return cache[locale]
}

export interface LocaleContextType {
  lang: LangKey
  setLang: (lang: LangKey) => void
  messages?: Messages
}

export const LocaleContext = createContext<LocaleContextType>(null as unknown as LocaleContextType)
export const useLocaleContext = () => useContext(LocaleContext)

export interface LocaleProviderProps {
  /** @default 'en-US' */
  lang?: LangKey
  children: ReactElement
}

export { LocaleProviderWrap as LocaleProvider }

function LocaleProviderWrap (props: LocaleProviderProps): ReactElement {
  const context = useContext(LocaleContext)

  // skip setting up another context if there is already a context available
  return context ? props.children : <LocaleProvider {...props} />
}

function LocaleProvider (props: LocaleProviderProps) {
  const [lang, setLang] = useState(props.lang ?? DEFAULT_SYS_LANG) // fallback language by default en-US
  const [messages, setMessages] = useState<Messages>()

  useEffect(() => {
    loadLocale(lang).then((message) => {
      setUpIntl({
        locale: lang,
        messages: message
      })
      setMessages(() => message)
    })
  }, [lang])

  const context = useMemo(() =>
    ({ lang, setLang, messages }), [lang, messages])
  return <LocaleContext.Provider value={context} children={props.children} />
}
