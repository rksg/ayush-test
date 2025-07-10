import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { useUpdateTenantSettingsMutation, useGetTenantSettingsQuery } from '@acx-ui/analytics/services'
import { Provider }                                                   from '@acx-ui/store'
import { render, screen }                                             from '@acx-ui/test-utils'
import { hasPermission }                                              from '@acx-ui/user'

import { AdminSettings } from './index'

jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateTenantSettingsMutation: jest.fn(),
  useGetTenantSettingsQuery: jest.fn()
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasPermission: jest.fn()
}))

const mockUpdateSettings = jest.fn()
const mockSettingsQuery = {
  data: undefined,
  isLoading: false,
  isError: false,
  isSuccess: false,
  refetch: jest.fn()
}
const mockUpdateResult = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  reset: jest.fn()
}

describe('AdminSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useUpdateTenantSettingsMutation).mockReturnValue([
      mockUpdateSettings,
      mockUpdateResult
    ])
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue(mockSettingsQuery)
    jest.mocked(hasPermission).mockReturnValue(true)
  })

  // eslint-disable-next-line max-len
  it('should render the component with description andunchecked checkbox when settings data is not available', async () => {
    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    expect(screen.getByText('Ignore TCM Connection Failures')).toBeInTheDocument()
    expect(screen.getByText(
      /When enabled, transient connection failures will not affect incidents/
    )).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('should initialize checkbox as checked when settings data has feature enabled', async () => {
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue({
      ...mockSettingsQuery,
      data: {
        'fetaure-related-events-suppression': 'true'
      }
    })

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  // eslint-disable-next-line max-len
  it('should initialize checkbox as unchecked when settings data has feature disabled', async () => {
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue({
      ...mockSettingsQuery,
      data: {
        'fetaure-related-events-suppression': 'false'
      }
    })

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should call updateSettings when checkbox is checked', async () => {
    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      'fetaure-related-events-suppression': 'true'
    })
  })

  it('should call updateSettings when checkbox is unchecked', async () => {
    // Start with checkbox checked
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue({
      ...mockSettingsQuery,
      data: {
        'fetaure-related-events-suppression': 'true'
      }
    })

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      'fetaure-related-events-suppression': 'false'
    })
  })

  // eslint-disable-next-line max-len
  it('should disable checkbox when user does not have WRITE_TENANT_SETTINGS permission', async () => {
    jest.mocked(hasPermission).mockReturnValue(false)

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('should enable checkbox when user has WRITE_TENANT_SETTINGS permission', async () => {
    jest.mocked(hasPermission).mockReturnValue(true)

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeDisabled()
  })

  it('should handle missing settings data gracefully', async () => {
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue({
      ...mockSettingsQuery,
      data: {}
    })

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should handle null settings data gracefully', async () => {
    jest.mocked(useGetTenantSettingsQuery).mockReturnValue({
      ...mockSettingsQuery,
      data: null
    })

    render(
      <Provider>
        <AdminSettings />
      </Provider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })
})