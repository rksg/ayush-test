import { rest } from 'msw'

import { act, mockServer }       from '@acx-ui/test-utils'
import {
  useUpdateUserProfileMutation
} from '@acx-ui/user'
import { UserUrlsInfo } from '@acx-ui/user'

import { detectBrowserLang,
  showBrowserLangDialog,
  updateBrowserCached } from './BrowserDialog'

jest.mock('@acx-ui/utils', () => ({
  getIntl: jest.fn(() => ({
    $t: jest.fn((message) => message.defaultMessage)
  })),
  setUpIntl: jest.fn()
}))
const mockUserProfile = {
  detailLevel: 'it',
  dateFormat: 'mm/dd/yyyy',
  preferredLanguage: 'en-US'
}
const params = { tenantId: 'tenant-id' }

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { preferredLanguage: 'en-US' } })
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUpdateUserProfileMutation: jest.fn(() =>
    ({ data: mockUserProfile, params: params }))
}))

const mockedUpdateUserProfileFn = jest.fn()

jest.mock('@acx-ui/components', () => ({
  showActionModal: jest.fn()
}))
const mockUseUpdateUserProfileMutation = useUpdateUserProfileMutation as jest.Mock
const mockBrowserDialog = jest.fn().mockResolvedValue({
  lang: 'fr-FR',
  isLoading: false
})

describe('showBrowserLangDialog', () => {
  beforeEach(() => {
    jest.mocked(mockUseUpdateUserProfileMutation).mockReturnValue({ data: mockUserProfile })

    mockServer.use(
      rest.get(
        UserUrlsInfo.updateUserProfile.url,
        (req, res, ctx) => {
          return res(ctx.json(mockUserProfile))
        }
      ),
      rest.put(
        UserUrlsInfo.updateUserProfile.url,
        (req, res, ctx) => {
          mockedUpdateUserProfileFn(req.body)
          return res(ctx.json({}))
        }
      ))
  })
  const mockUserProfile = {
    preferredLanguage: 'fr-FR',
    detailLevel: 'it',
    dateFormat: 'mm/dd/yyyy'
  }
  it('should show action modal and handle confirm button click', async () => {
    await act(async () => {
      showBrowserLangDialog('en-US')
    })

    expect(require('@acx-ui/components').showActionModal).toHaveBeenCalled()
    const modalProps = require('@acx-ui/components').showActionModal.mock.calls[0][0]

    await act(async () => {
      modalProps.customContent.buttons[1].handler()
    })
  })
  it('should open browser dialog and return updated preferred language', async () => {
    global.localStorage.getItem = jest.fn().mockReturnValue(null)
    global.localStorage.setItem = jest.fn()
    jest.spyOn(require('./BrowserDialog'),
      'showBrowserLangDialog').mockImplementation(mockBrowserDialog)
    await Promise.resolve()
    const result = await showBrowserLangDialog('en-US')
    await Promise.resolve()
    expect(result).toStrictEqual({ lang: 'fr-FR', isLoading: false })
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
    const lang = 'en-US'
    updateBrowserCached(lang)
    Storage.prototype.setItem = jest.fn()
    updateBrowserCached('en-US')
    expect(localStorage.setItem).toHaveBeenCalledWith('browserLang', 'en-US')
  })
})

