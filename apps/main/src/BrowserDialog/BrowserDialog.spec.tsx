import { rest } from 'msw'

import { Provider }               from '@acx-ui/store'
import { mockServer, renderHook } from '@acx-ui/test-utils'
import { UserUrlsInfo }           from '@acx-ui/user'

import { detectBrowserLang,
  useBrowserDialog,
  updateBrowserCached } from './BrowserDialog'


jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { preferredLanguage: 'en-US' } })
}))

const mockedUpdateUserProfileFn = jest.fn()

jest.mock('@acx-ui/components', () => ({
  showActionModal: jest.fn().mockReturnValue('showActionModal')
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: () => ({
    messages: { 'en-US': { lang: 'Language' } },
    lang: 'en-US',
    setLang: jest.fn()
  })
}))

describe('showBrowserLangDialog', () => {
  beforeEach(() => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.updateUserProfile.url,
        (req, res, ctx) => {
          mockedUpdateUserProfileFn(req.body)
          return res(ctx.json({}))
        }
      ))
  })
  it('should not show action modal', async () => {
    Object.defineProperty(window.navigator, 'languages', {
      value: ['en'],
      writable: true
    })
    const { result } = renderHook(() => useBrowserDialog(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })
    expect(result.current.showBrowserLangDialog()).toStrictEqual(undefined)
  })
  it('should show action modal', async () => {
    // Navigator.languages property mocked
    Object.defineProperty(window.navigator, 'languages', {
      value: ['fr'],
      writable: true
    })
    const { result } = renderHook(() => useBrowserDialog(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })
    expect(result.current.showBrowserLangDialog()).toStrictEqual('showActionModal')
  })
})

describe('detectBrowserLang', () => {
  it('should return the correct language', () => {
    // Navigator.languages property mocked
    Object.defineProperty(window.navigator, 'languages', {
      value: ['en-US', 'en', 'fr'],
      writable: true
    })

    const result = detectBrowserLang()
    expect(result).toEqual('en-US')
  })
})

describe('updateBrowserCached', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should update localStorage with the correct values', async () => {
    updateBrowserCached('en-US')
    expect(localStorage.getItem('browserLang')).toStrictEqual('en-US')
  })
})

