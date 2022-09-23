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
  localeLoaders
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

  it('locale provided is in allowed list of languages', async () => {
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

  it('locale provided is not in allowed list of languages', async () => {
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
})

describe('LocaleProvider', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get('/locales/compiled/:locale.json', (req, res, ctx) => {
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
