import '@testing-library/jest-dom'
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
  LocaleContext
} from './locales'

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

describe('loadLocale', () => {
  it('loads locale translation json of correct language', async () => {
    mockServer.use(
      rest.get('/locales/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res(ctx.json({ ...messages[locale], locale }))
      })
    )

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

  it('loads from cache when available', async () => {
    mockServer.close()
    mockServer.listen({ onUnhandledRequest: 'error' })
    mockServer.use(
      rest.get('/locales/:locale.json', (req, res, ctx) => {
        const { locale } = req.params as { locale: keyof typeof messages }
        return res.once(ctx.json({ ...messages[locale], locale }))
      })
    )

    const expected = expect.objectContaining({
      ...messages['en-US'],
      'nested.lang': 'Language'
    })

    expect(await loadLocale('en-US')).toEqual(expected)
    expect(await loadLocale('en-US')).toEqual(expected)
  })
})

describe('LocaleProvider', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get('/locales/:locale.json', (req, res, ctx) => {
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
      <LocaleProvider test lang='de-DE'>
        <LocaleProvider test lang='en-US'>
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
