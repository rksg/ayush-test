import { getDisplayLanguage, reset } from './getDisplayLanguage'
import { setUpIntl }                 from './intlUtil'

describe('getDisplayLanguage', () => {
  afterEach(() => reset())

  const testDisplayLanguages = (expectedMap: Record<string, string>, codes: string[]) => {
    const expected = codes.map(code => expectedMap[code])
    const result = codes.map(code => getDisplayLanguage(code))
    expect(result).toEqual(expected)
  }

  it('handles en-US', () => {
    setUpIntl({ locale: 'en-US' })
    testDisplayLanguages({
      'en': 'English',
      'zh-hans': 'Simplified Chinese (简体中文)',
      'zh-hant': 'Traditional Chinese (繁體中文)',
      'ja': 'Japanese (日本語)',
      'de': 'German (Deutsch)'
    }, ['en', 'zh-hans', 'zh-hant', 'zh-hant', 'ja', 'de'])
  })
  it('handles de', () => {
    setUpIntl({ locale: 'de-DE' })
    testDisplayLanguages({
      'en': 'Englisch (English)',
      'zh-hant': 'Chinesisch (traditionell) (繁體中文)',
      'ja': 'Japanisch (日本語)',
      'de': 'Deutsch'
    }, ['en', 'zh-hant', 'ja', 'de'])
  })
  it('handles zh-TW', () => {
    setUpIntl({ locale: 'zh-TW' })
    testDisplayLanguages({
      'en': '英文 (English)',
      'zh-hant': '繁體中文',
      'ja': '日文 (日本語)',
      'de': '德文 (Deutsch)'
    }, ['en', 'zh-hant', 'ja', 'de'])
  })
})
