import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from 'react'

import { Locale } from 'antd/lib/locale-provider'
import { merge }  from 'lodash'

import { setUpIntl } from './intlUtil'

type Message = string | NestedMessages
type NestedMessages = { [key: string]: Message }
type Messages = Locale & Record<string, string>

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

function localePath (locale: string) {
  return `locales/compiled/${locale}.json`
}

async function loadEnUS (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/en_US').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/en_US').then(result => result.default),
    fetch(localePath('en-US')).then(res => res.json()) as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadDe (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/de_DE').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/de_DE').then(result => result.default),
    fetch(localePath('de-DE')).then(res => res.json()) as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadJp (): Promise<Messages> {
  const [base, proBase, translation] = await Promise.all([
    import('antd/lib/locale/ja_JP').then(result => result.default),
    import('@ant-design/pro-provider/lib/locale/ja_JP').then(result => result.default),
    fetch(localePath('ja-JP')).then(res => res.json()) as Promise<NestedMessages>
  ])

  const combine = merge({}, base, proBase, translation)
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

const localeLoaders = {
  'en-US': loadEnUS,
  'de-DE': loadDe,
  'ja-JP': loadJp
}

type Key = keyof typeof localeLoaders
const cache: Partial<Record<Key, Messages>> = {}
export async function loadLocale (locale: Key) {
  const result = cache[locale]
  if (result) { return result }

  cache[locale] = await localeLoaders[locale]()
  return cache[locale]
}

export interface LocaleContextType {
  lang: Key
  setLang: (lang: Key) => void
  messages?: Messages
}

export const LocaleContext = createContext<LocaleContextType>(null as unknown as LocaleContextType)

export interface LocaleProviderProps {
  /** @default 'en-US' */
  lang?: Key
  children: ReactElement
}

export { LocaleProviderWrap as LocaleProvider }

function LocaleProviderWrap (props: LocaleProviderProps): ReactElement {
  const context = useContext(LocaleContext)

  // skip setting up another context if there is already a context available
  return context ? props.children : <LocaleProvider {...props} />
}

function LocaleProvider (props: LocaleProviderProps) {
  const [lang, setLang] = useState(props.lang ?? 'en-US') // fallback language by default en-US
  const [messages, setMessages] = useState<Messages>()

  useEffect(() => {
    loadLocale(lang).then((message) => {
      setMessages(() => message)
      setUpIntl({
        locale: lang,
        messages: message
      })
    })
  }, [lang])

  const context = useMemo(() =>
    ({ lang, setLang, messages }), [lang, messages])
  return <LocaleContext.Provider value={context} children={props.children} />
}
