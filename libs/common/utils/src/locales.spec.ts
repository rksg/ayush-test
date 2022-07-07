import { rest } from 'msw'

import { mockServer } from '@acx-ui/test-utils'

import { loadLocale } from './locales'

describe('loadLocale', () => {
  const messages = {
    'en-US': {
      lang: 'Language',
      nested: { lang: 'Language' }
    },
    'de-DE': {
      lang: 'Sprache',
      nested: { lang: 'Sprache' }
    }
  }
  beforeEach(() => {
    mockServer.use(
      rest.get('/locales/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
  })

  it('loads locale translation json of correct language', async () => {
    const en = await loadLocale('en-US')
    expect(en).toEqual(expect.objectContaining({
      ...messages['en-US'],
      'nested.lang': 'Language'
    }))
    const de = await loadLocale('de-DE')
    expect(de).toEqual(expect.objectContaining({
      ...messages['de-DE'],
      'nested.lang': 'Sprache'
    }))
  })
})
