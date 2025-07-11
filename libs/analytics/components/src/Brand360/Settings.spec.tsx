import userEvent from '@testing-library/user-event'
import { range } from 'lodash'

import { useUpdateTenantSettingsMutation, useBrand360Config } from '@acx-ui/analytics/services'
import type { Settings }                                      from '@acx-ui/analytics/utils'
import { Provider }                                           from '@acx-ui/store'
import { screen, render, fireEvent, waitFor }                 from '@acx-ui/test-utils'
import { WifiScopes }                                         from '@acx-ui/types'
import { aiOpsApis, getUserProfile, setUserProfile }          from '@acx-ui/user'

import { ConfigSettings } from './Settings'

const mockedUseUpdateTenantSettingsMutation = useUpdateTenantSettingsMutation as jest.Mock
const mockedUseBrand360Config = useBrand360Config as jest.Mock
const mockedUpdateTenantSettingsMutation = jest.fn()
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateTenantSettingsMutation: jest.fn(),
  useBrand360Config: jest.fn()
}))

const route = { params: { tenantId: '0012h00000NrljgAAB' } }

describe('ConfigSettings Drawer', () => {
  beforeEach(() => {
    mockedUseUpdateTenantSettingsMutation.mockImplementation(
      () => [mockedUpdateTenantSettingsMutation, { isLoading: false }]
    )
    mockedUseBrand360Config.mockImplementation(() => ({
      names: { lsp: 'lsp', brand: 'brand', property: 'property' }
    }))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should open and close drawer', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    expect(await screen.findByText('^[a-zA-Z0-9]{5}_GUEST$')).toBeVisible()
    await userEvent.click(await screen.findByText('Cancel'))
    expect(await screen.findByTestId('settings')).toBeVisible()
    await userEvent.click(await screen.findByTestId('settings'))
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(await screen.findByTestId('settings')).toBeVisible()
  })
  it('should save settings', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': ''
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    const target = '  ssidRegex1  \n ssidRegex2 '
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: target } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).toBeCalledWith({
      'brand-ssid-compliance-matcher': 'ssidRegex1\nssidRegex2',
      'brand-name': 'brand',
      'property-name': 'property',
      'lsp-name': 'lsp'
    })
  })
  it('should not save if invalid ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: 'abc(' } })
    await userEvent.click(await screen.findByText('Save'))
    expect(await screen.findByText('Line: 1 is not a valid Java Regular Expression!'))
      .toBeVisible()
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
  it('should not save if empty ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: '' } })
    expect(await screen.findByText('SSID Regular Expression is required!'))
      .toBeVisible()
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
  it('should not save if same ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: 'test' } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
  it('should not save if ssid regex exceeds 1000 characters', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    const thousandChar = range(1001).map(() => '1').join('')
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: thousandChar } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
  it('should not save if ssid regex has blanks', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('settings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    const spaceRegex = 'brand360\n\nxd'
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: spaceRegex } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })

  it.each([WifiScopes.READ, aiOpsApis.readBrand360Dashboard])(
    'shows read only settings when scope contains %s only', async (scope) => {
      const userProfile = getUserProfile()
      setUserProfile({
        ...userProfile,
        abacEnabled: true,
        isCustomRole: true,
        scopes: [scope]
      })
      const settings = {
        'brand-ssid-compliance-matcher': ''
      }
      render(<ConfigSettings settings={settings as Settings} />, { wrapper: Provider, route })
      await userEvent.click(await screen.findByTestId('settings'))
      expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
        .toBeVisible()
      await waitFor(async () =>
        expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled()
      )
    })
})
