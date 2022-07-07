type Message = string | NestedMessages
type NestedMessages = { [key: string]: Message }

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

async function loadEnUS () {
  const base = (await import('antd/lib/locale/en_US')).default
  const translation: NestedMessages = await fetch('/locales/en-US.json')
    .then(res => res.json())

  const combine = { ...base, ...translation }
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

async function loadDe () {
  const base = (await import('antd/lib/locale/de_DE')).default
  const translation: NestedMessages = await fetch('/locales/de-DE.json')
    .then(res => res.json())

  const combine = { ...base, ...translation }
  return Object.assign({}, combine, flattenMessages(combine as unknown as NestedMessages))
}

const localeLoaders = {
  'en-US': loadEnUS,
  'de-DE': loadDe
}

export function loadLocale (locale: keyof typeof localeLoaders) {
  return localeLoaders[locale]()
}
