import userEvent from '@testing-library/user-event'
import { range } from 'lodash'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import type { Settings }                   from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { screen, render, fireEvent }       from '@acx-ui/test-utils'

import { ComplianceSetting } from './ComplianceSetting'

const mockedUseUpdateTenantSettingsMutation = useUpdateTenantSettingsMutation as jest.Mock
const mockedUpdateTenantSettingsMutation = jest.fn()
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateTenantSettingsMutation: jest.fn()
}))
const route = { params: { tenantId: '0012h00000NrljgAAB' } }
describe('ComplianceSetting Drawer', () => {
  beforeEach(() => {
    mockedUseUpdateTenantSettingsMutation.mockImplementation(
      () => [mockedUpdateTenantSettingsMutation, { isLoading: false }]
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should open and close drawer', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$'
    }
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    expect(await screen.findByText('^[a-zA-Z0-9]{5}_GUEST$')).toBeVisible()
    await userEvent.click(await screen.findByText('Cancel'))
    expect(await screen.findByTestId('ssidSettings')).toBeVisible()
    await userEvent.click(await screen.findByTestId('ssidSettings'))
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(await screen.findByTestId('ssidSettings')).toBeVisible()
  })
  it('should save ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': ''
    }
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: 'abc' } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).toBeCalledWith({
      'brand-ssid-compliance-matcher': 'abc'
    })
  })
  it('should not save if invalid ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: 'abc(' } })
    await userEvent.click(await screen.findByText('Save'))
    expect(await screen.findByText('Input is not a valid Java Regular Expression!'))
      .toBeVisible()
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
  it('should not save if empty ssid regex', async () => {
    const settings = {
      'brand-ssid-compliance-matcher': 'test'
    }
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
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
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
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
    render(<ComplianceSetting settings={settings as Settings} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByTestId('ssidSettings'))
    expect(await screen.findByText('Choose a pattern to validate Brand SSID compliance'))
      .toBeVisible()
    const thousandChar = range(1001).map(() => '1').join('')
    fireEvent.change(await screen.findByTestId('ssidRegex'), { target: { value: thousandChar } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUpdateTenantSettingsMutation).not.toHaveBeenCalled()
  })
})
