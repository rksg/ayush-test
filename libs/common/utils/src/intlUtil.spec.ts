import { MissingDataError, MissingTranslationError } from '@formatjs/intl'
import { rest }                                      from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import * as intlUtil  from './intlUtil'
import { loadLocale } from './locales'

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
    intlUtil.setUpIntl()
    expect(() => intlUtil.getIntl()).toThrow('setUpIntl must be called before getIntl')
    // restore intl
    intlUtil.setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    expect(intlUtil.getIntl()).toBeTruthy()
  })

  it('should handle default translation', () => {
    const intl = intlUtil.getIntl()
    expect(intl).toBeTruthy()
  })

  it('should be able to handle translations', async () => {

    const usMessages = await loadLocale('en-US')
    intlUtil.setUpIntl({
      locale: 'en-US',
      messages: usMessages
    })
    let intl = intlUtil.getIntl()
    expect(intl).toBeTruthy()

    expect(intl.messages).toMatchObject(usMessages!)

    const jpMessages = await loadLocale('ja-JP')
    intlUtil.setUpIntl({
      locale: 'ja-JP',
      messages: jpMessages
    })
    intl = intlUtil.getIntl()
    expect(intl.messages).toMatchObject(jpMessages!)

    const deMessages = await loadLocale('de-DE')
    intlUtil.setUpIntl({
      locale: 'de-DE',
      messages: deMessages
    })
    intl = intlUtil.getIntl()
    expect(intl.messages).toMatchObject(deMessages!)
  })

  describe('onIntlError', () => {
    const oldEnv = process.env

    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      process.env = oldEnv
      jest.restoreAllMocks()
    })

    const error = new Error('error')
    const missingTranslationError = new MissingTranslationError({}, 'en-US')
    const missingDataError = new MissingDataError('message', error)
    /* eslint-disable no-console */
    it('calls console error', () => {
      const err = missingDataError
      const logError = jest.mocked(console.error).mockImplementation(() => {})
      intlUtil.onIntlError(err)
      expect(logError).toHaveBeenCalledWith(err)
    })
    it('silent MissingTranslationError', () => {
      const err = missingTranslationError
      intlUtil.onIntlError(err)
      expect(jest.mocked(console.error)).not.toHaveBeenCalledWith(err)
    })
    it('silent in production', () => {
      process.env = { NODE_ENV: 'production' }
      const err = missingDataError
      intlUtil.onIntlError(err)
      expect(jest.mocked(console.error)).not.toHaveBeenCalledWith(err)
    })
    /* eslint-enable no-console */
  })

})
