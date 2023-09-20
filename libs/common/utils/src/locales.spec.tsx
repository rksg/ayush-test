import '@testing-library/jest-dom'
import _        from 'lodash'
import { rest } from 'msw'

import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  loadLocale,
  LocaleProvider,
  LocaleContext,
  useLocaleContext,
  localeLoaders,
  localePath
} from './locales'

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

describe('loadLocale', () => {
  it('loads locale translation json of correct language', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )

    const en = await loadLocale('en-US')
    expect(en).toEqual(expect.objectContaining({
      ..._.omit(messages['en-US'], 'stepsForm'),
      'nested.lang': 'Language'
    }))
    expect(en!.stepsForm).toEqual(expect.objectContaining({
      cancel: expect.any(String),
      next: expect.any(String)
    }))

    const de = await loadLocale('de-DE')
    expect(de).toEqual(expect.objectContaining({
      ..._.omit(messages['de-DE'], 'stepsForm'),
      'nested.lang': 'Sprache'
    }))
    expect(de!.stepsForm).toEqual(expect.objectContaining({
      cancel: expect.any(String),
      next: expect.any(String)
    }))

    const ja = await loadLocale('ja-JP')
    expect(ja).toEqual(expect.objectContaining({
      ..._.omit(messages['ja-JP'], 'stepsForm'),
      'nested.lang': '言語'
    }))
    expect(ja!.stepsForm).toEqual(expect.objectContaining({
      cancel: expect.any(String),
      next: expect.any(String)
    }))
  })

  it('loads from cache when available', async () => {
    mockServer.close()
    mockServer.listen({ onUnhandledRequest: 'error' })
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )

    await loadLocale('en-US')
    // should throw if cache not being use
    await loadLocale('en-US')
  })

  it('locale ja-JP provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'ja-JP'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })

  it('locale provided is NOT in allowed list of languages', async () => {
    const locale = 'ru-RU'
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
    const spy = jest.spyOn(localeLoaders, 'en-US')
    await loadLocale(locale as keyof typeof localeLoaders, true)
    expect(spy).toBeCalled()
  })

  it('locale es-ES provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'es-ES'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })

  it('locale fr-FR provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'fr-FR'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })

  it('locale ko-KR provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'ko-KR'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })

  it('locale pt-BR provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'pt-BR'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })

  it('locale zh-CN provided is in allowed list of languages', async () => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )
    const locale = 'zh-CN'
    const spy = jest.spyOn(localeLoaders, locale)
    await loadLocale(locale, true)
    expect(spy).toBeCalled()
  })
})

describe('LocaleProvider', () => {
  const url = '/locales/compiled/:locale.json'
  beforeEach(() => {
    mockServer.use(
      rest.get(url, (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
  })

  it('default to en-US', async () => {
    render(
      <LocaleProvider>
        <LocaleContext.Consumer>
          {(context) => <div data-testid='target'>{context.messages?.lang}</div>}
        </LocaleContext.Consumer>
      </LocaleProvider>
    )

    const target = await waitFor(() => screen.findByText('Language'))
    expect(target).toBeVisible()
  })
  it('loads other locale', async () => {
    render(
      <LocaleProvider lang='de-DE'>
        <LocaleContext.Consumer>
          {(context) => <div data-testid='target'>{context.messages?.lang}</div>}
        </LocaleContext.Consumer>
      </LocaleProvider>
    )

    const target = await waitFor(() => screen.findByText('Sprache'))
    expect(target).toBeVisible()
  })

  it('supports changing locale', async () => {
    render(
      <LocaleProvider lang='de-DE'>
        <LocaleContext.Consumer>
          {(context) => <div
            data-testid='target'
            children={context.messages?.lang}
            onClick={() => context.setLang('en-US')}
          />}
        </LocaleContext.Consumer>
      </LocaleProvider>
    )

    const target = await screen.findByTestId('target')
    await waitFor(() => expect(target).toHaveTextContent('Sprache'))

    fireEvent.click(target)

    await waitFor(() => expect(target).toHaveTextContent('Language'))
  })

  it('skip render LocaleProvider when already in LocaleContext', async () => {
    render(
      <LocaleProvider lang='de-DE'>
        <LocaleProvider lang='en-US'>
          <LocaleContext.Consumer>
            {(context) => <div data-testid='target'>{context.messages?.lang}</div>}
          </LocaleContext.Consumer>
        </LocaleProvider>
      </LocaleProvider>
    )

    const target = await waitFor(() => screen.findByText('Sprache'))
    expect(target).toBeVisible()
  })
})

describe('useLocaleContext', () => {
  const url = '/locales/compiled/:locale.json'
  beforeEach(() => {
    mockServer.use(
      rest.get(url, (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
  })

  it('returns locale', async () => {
    const TestUseLocaleContext = () => {
      const locale = useLocaleContext()
      return <div>{locale.messages?.lang}</div>
    }

    render(<TestUseLocaleContext />, {
      wrapper: (props) => <LocaleProvider lang='de-DE' {...props} />
    })

    expect(await screen.findByText('Sprache')).toBeVisible()
  })
})

describe('localePath', () => {
  const url = '/locales/compiled/:locale.json'
  beforeEach(() => {
    mockServer.use(
      rest.get(url, (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )
  })
  it('should throw an error if response is not ok', async () => {
    const locale = 'es-ES'
    try {
      await localePath(locale)
    } catch(err) {
      // eslint-disable-next-line
      expect(err).toBeInstanceOf(Error)
    }
  })

  it('should return empty object', async () => {
    const url = '/locales/compiled/:locale.json'
    mockServer.use(
      rest.get(url, (req, res, ctx) => {
        return res(ctx.json({}))
      })
    )
    const result = await localePath('es')
    expect(result).toEqual({})
  })
})
