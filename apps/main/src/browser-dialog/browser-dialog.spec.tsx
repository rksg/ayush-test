// import { render, fireEvent, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { showActionModal }              from '@acx-ui/components'
import {
  useUpdateUserProfileMutation,
  UserProfile as UserProfileInterface
} from '@acx-ui/user'

import { BrowserDialog, LoadMessages, BrowserDialogProps } from './browser-dialog' // Replace with the actual path

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
  useUpdateUserProfileMutation: jest.fn(() =>
    ({ data: { preferredLanguage: 'en-US' }, params: params }))
}))
jest.mock('@acx-ui/components', () => ({
  showActionModal: jest.fn()
}))
const mockUseUpdateUserProfileMutation = useUpdateUserProfileMutation as jest.Mock
const mockBrowserDialog = jest.fn().mockResolvedValue({
  preferredLanguage: 'fr-FR' // Updated preferred language
})

const setDialogOpen = jest.fn()

describe('BrowserDialog', () => {
  beforeEach(() => {
    jest.mocked(mockUseUpdateUserProfileMutation).mockReturnValue({ data: mockUserProfile })
  })

  it.skip('should show action modal and handle confirm button click', async () => {
    const setDialogOpen = jest.fn()
    const updateUserProfile = jest.fn()
    const bDialogProps = {
      detailLevel: 'mockDetailLevel',
      dateFormat: 'mockDateFormat',
      preferredLanguage: 'mockPreferredLanguage',
      isDialogOpen: true,
      setDialogOpen: setDialogOpen
    }
    await act(async () => {
      BrowserDialog('en-US', bDialogProps as BrowserDialogProps)
    })

    // Assert modal is shown
    expect(require('@acx-ui/components').showActionModal).toHaveBeenCalled()
    const modalProps = require('@acx-ui/components').showActionModal.mock.calls[0][0]

    // Simulate clicking the "Change to" button
    await act(async () => {
      modalProps.customContent.buttons[1].handler()
    })

    // Assert functions were called
    expect(updateUserProfile).toHaveBeenCalledWith({
      dateFormat: 'mockDateFormat',
      detailLevel: 'mockDetailLevel',
      preferredLanguage: 'en-US'
    })
    expect(setDialogOpen).toHaveBeenCalledWith(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('browserLang', 'en-US')
    expect(localStorage.setItem).toHaveBeenCalledWith('isBrowserDialog', 'true')
  })

  it.skip('should open dialog and handle language change', async () => {
    const props = {
      detailLevel: 'it',
      dateFormat: 'mm/dd/yyyy',
      preferredLanguage: 'en-US',
      isDialogOpen: true,
      setDialogOpen
    }
    BrowserDialog('en-US', props as BrowserDialogProps)
    expect(showActionModal).toHaveBeenCalled()

    // expect(setDialogOpen).toHaveBeenCalledWith(true)
    // Expectations related to API calls and localStorage can be added as well
  })

  it.skip('should call showActionModal when isDialogOpen is true', async () => {
    const props = {
      detailLevel: 'someDetailLevel',
      dateFormat: 'someDateFormat',
      preferredLanguage: 'en-US',
      isDialogOpen: true,
      setDialogOpen
    }

    await BrowserDialog('en-US', props as BrowserDialogProps)
    expect(showActionModal).toHaveBeenCalled()
  })
})

describe('LoadMessages', () => {
  it('should not open dialog if language is the same', () => {
    const userProfile = {
      preferredLanguage: 'en-US',
      detailLevel: 'it',
      dateFormat: 'mm/dd/yyyy'
    }

    const result = LoadMessages(userProfile as UserProfileInterface)
    expect(result).toBe('en-US')
  })

  it.skip('should open browser dialog and return updated preferred language', async () => {
    const originalLocalStorage = { ...global.localStorage }
    global.localStorage.getItem = jest.fn().mockReturnValue(null)
    global.localStorage.setItem = jest.fn()

    const userProfile = {
      preferredLanguage: 'fr-FR',
      detailLevel: 'mockDetailLevel',
      dateFormat: 'mockDateFormat'
    }

    const bDialogProps = {
      detailLevel: 'mockDetailLevel',
      dateFormat: 'mockDateFormat',
      isDialogOpen: true,
      preferredLanguage: 'en-US',
      setDialogOpen
    }

    jest.spyOn(require('./browser-dialog'), 'BrowserDialog').mockImplementation(mockBrowserDialog)
    await Promise.resolve()
    const result = await LoadMessages(userProfile as UserProfileInterface)

    expect(mockBrowserDialog).toHaveBeenCalledWith('en-US', bDialogProps)

    // await Promise.resolve()
    expect(result).toBe('fr-FR')

    global.localStorage = originalLocalStorage
  })
})
