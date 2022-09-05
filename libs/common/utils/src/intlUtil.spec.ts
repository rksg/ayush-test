import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { setUpIntl, getIntl } from './intlUtil'
import { loadLocale }         from './locales'

describe('IntlUtils', () => {
  const messages = {
    'en-US': {
      lang: 'Language',
      nested: { lang: 'Language' },
      stepsForm: { cancel: 'Cancel' }
    },
    'de-DE': {
      lang: 'Sprache',
      nested: { lang: 'Sprache' },
      stepsForm: { cancel: 'Absagen' }
    },
    'ja-JP': {
      lang: '言語',
      nested: { lang: '言語' },
      stepsForm: { cancel: 'キャンセル' }
    }
  }

  beforeEach(() => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
  })
  it('should throw error when called without setup', () => {
    expect(() => getIntl()).toThrow('setUpIntl must be called before getIntl')
  })

  it('should handle default translation', () => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })

    const intl = getIntl()
    expect(intl).toBeTruthy()
  })

  it('should be able to handle translations', async () => {
    
    const usMessages = await loadLocale('en-US')
    setUpIntl({
      locale: 'en-US',
      messages: usMessages
    })
    let intl = getIntl()
    expect(intl).toBeTruthy()

    expect(intl.messages).toMatchObject(usMessages!)

    const jpMessages = await loadLocale('ja-JP')
    setUpIntl({
      locale: 'ja-JP',
      messages: jpMessages
    })
    intl = getIntl()
    expect(intl.messages).toMatchObject(jpMessages!)

    const deMessages = await loadLocale('de-DE')
    setUpIntl({
      locale: 'de-DE',
      messages: deMessages
    })
    intl = getIntl()
    expect(intl.messages).toMatchObject(deMessages!)
  })


})