/* eslint-disable max-len */

import { userEvent } from '@storybook/testing-library'
import { within }    from '@testing-library/react'
import { Form }      from 'antd'

import { useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { NetworkSaveData, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen }         from '@acx-ui/test-utils'

import WiFi7, {
  disabledUnCheckOption,
  enableAllRadioCheckboxes, getIsOwe,
  getInitMloEnabled,
  getInitMloOptions, getWlanSecurity,
  inverseTargetValue,
  isEnableOptionOf6GHz
} from '.'

describe('test getInitMloEnabled', () => {
  // eslint-disable-next-line max-len
  it('should return true when multiLinkOperationEnabled is true and initWifi7Enabled is true', function () {
    const initWifi7Enabled = true
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          multiLinkOperationEnabled: true
        }
      }
    } as NetworkSaveData
    const actual = getInitMloEnabled(mockWlanData, initWifi7Enabled)
    expect(actual).toBe(true)
  })

  // eslint-disable-next-line max-len
  it('should return false when multiLinkOperationEnabled is false and initWifi7Enabled is true', function () {
    const initWifi7Enabled = true
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          multiLinkOperationEnabled: false
        }
      }
    } as NetworkSaveData
    const actual = getInitMloEnabled(mockWlanData, initWifi7Enabled)
    expect(actual).toBe(false)
  })

  // eslint-disable-next-line max-len
  it('should return false when multiLinkOperationEnabled is true and initWifi7Enabled is false', function () {
    const initWifi7Enabled = false
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          multiLinkOperationEnabled: true
        }
      }
    } as NetworkSaveData
    const actual = getInitMloEnabled(mockWlanData, initWifi7Enabled)
    expect(actual).toBe(false)
  })

  // eslint-disable-next-line max-len
  it('should return false when multiLinkOperationEnabled is false and initWifi7Enabled is false', function () {
    const initWifi7Enabled = false
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          multiLinkOperationEnabled: false
        }
      }
    } as NetworkSaveData
    const actual = getInitMloEnabled(mockWlanData, initWifi7Enabled)
    expect(actual).toBe(false)
  })
})

describe('WiFi7', () => {
  it('should render correctly when useIsSplitOn return true', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = null

    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData}/>
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    within(heading).getByText('Wi-Fi 7')
    within(heading).getByTestId('QuestionMarkCircleOutlined')

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements.length).toBe(2)
    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    expect(screen.getByText('Enable Multi-Link operation (MLO)')).toBeInTheDocument()
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
  })

  it('should not render MLO field item render when useIsSplitOn return false', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = null
    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    within(heading).getByText('Wi-Fi 7')
    within(heading).getByTestId('QuestionMarkCircleOutlined')

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements.length).toBe(1)
    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    expect(screen.queryByText('Enable Multi-Li' +
            'nk operation (MLO)')).not.toBeInTheDocument()
  })

  it('should switch enable wifi toggle correctly', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = null

    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    fireEvent.click(switchElements[0])
    expect(switchElements[0]).not.toBeChecked()
    expect(switchElements[1]).not.toBeChecked()

    fireEvent.click(switchElements[0])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
  })

  it('should switch enable mlo toggle correctly', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = null

    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElement = screen.getAllByRole('checkbox')
    expect(checkboxElement.length).toBe(3)
    expect(checkboxElement[0]).toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()
  })
})

describe('test isEnableOptionOf6GHz func', () => {
  it('should return true when wlanSecurity is WPA3', function () {
    const mockWlanData = {
      name: 'test',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3
      }
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(true)
  })

  it('should return true when wlanSecurity is OWE and enableOwe is undefined', function () {
    const mockWlanData = {
      name: 'test',
      wlan: {
        wlanSecurity: WlanSecurityEnum.OWE
      },
      enableOwe: undefined
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(true)
  })

  it('should return true when enableOwe is true and wlanSecurity is undefined', function () {
    const mockWlanData = {
      name: 'test',
      wlan: {
        wlanSecurity: undefined
      },
      enableOwe: true
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(true)
  })

  it('should return false when wlanSecurity is not WPA3 or OWE', function () {
    const mockWlanData = {
      name: 'test',
      wlan: {
        wlanSecurity: 'Open'
      }
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(false)
  })

  it('should return true when enableOwe is true', function () {
    const mockWlanData = {
      name: 'test',
      type: 'open',
      enableOwe: true
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(true)
  })

  it('should return true when enableOwe is false', function () {
    const mockWlanData = {
      name: 'test',
      type: 'open',
      enableOwe: false
    } as NetworkSaveData
    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(false)
  })
})

describe('test handleDisabledUnCheckOption func', () => {
  it('should disable the uncheck option and return new state of options correctly', function () {
    const options = [
      {
        index: 0,
        name: 'enable24G',
        value: true,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: false
      },
      {
        index: 2,
        name: 'enable6G',
        value: true,
        label: '6 GHz',
        disabled: false
      }
    ]

    const expecteds = [
      {
        index: 0,
        name: 'enable24G',
        value: true,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: true
      },
      {
        index: 2,
        name: 'enable6G',
        value: true,
        label: '6 GHz',
        disabled: false
      }
    ]

    const actuals = disabledUnCheckOption(options)

    expecteds.forEach(expected => expect(actuals).toContainEqual(expected))
  })
})

describe('test enableAll func', () => {
  it('should enable all of options', function () {
    const options = [
      {
        index: 0,
        name: 'enable24G',
        value: true,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: true
      },
      {
        index: 2,
        name: 'enable6G',
        value: true,
        label: '6 GHz',
        disabled: true
      }
    ]

    const expecteds = [
      {
        index: 0,
        name: 'enable24G',
        value: true,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: false
      },
      {
        index: 2,
        name: 'enable6G',
        value: true,
        label: '6 GHz',
        disabled: false
      }
    ]

    const actuals = enableAllRadioCheckboxes(options)

    expecteds.forEach(expected => expect(actuals).toContainEqual(expected))
  })
})

describe('CheckboxGroup', () => {
  it('should enable option when selected less than two', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElement = screen.getAllByRole('checkbox')
    expect(checkboxElement.length).toBe(3)
    expect(checkboxElement[0]).toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()
    expect(checkboxElement[2]).toBeDisabled()

    fireEvent.click(checkboxElement[0])
    expect(checkboxElement[2]).not.toBeDisabled()
  })
  it('should show error msg when selected less than two', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <WiFi7 wlanData={mockWlanData} />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElement = screen.getAllByRole('checkbox')
    expect(checkboxElement.length).toBe(3)
    expect(checkboxElement[0]).toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()
    expect(checkboxElement[2]).toBeDisabled()

    await userEvent.click(checkboxElement[0])
    expect(await screen.findByText('Please select two radios')).toBeVisible()
    expect(checkboxElement[0]).not.toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()
    expect(checkboxElement[2]).not.toBeDisabled()
  })
})

describe('test getInitMloOptions func', () => {
  it('should return default when properties value contains undefined', function () {
    const mockMloOptions = {
      enable24G: true,
      enable50G: true,
      enable6G: undefined
    }
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: false
    }
    const actual = getInitMloOptions(mockMloOptions)
    expect(actual).toEqual(expected)
  })

  it('should return same value when properties value does not contain undefined', function () {
    const mockMloOptions = {
      enable24G: true,
      enable50G: true,
      enable6G: true
    }
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: true
    }
    const actual = getInitMloOptions(mockMloOptions)
    expect(actual).toEqual(expected)
  })
})

describe('test getUpdatedStateOfOptionsOnChange func', () => {
  it('should return correctly', function () {
    const target = {
      index: 0,
      name: 'enable24G',
      value: false,
      label: '2.4 GHz',
      disabled: false
    }

    const options = [
      {
        index: 0,
        name: 'enable24G',
        value: false,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: false
      },
      {
        index: 2,
        name: 'enable6G',
        value: false,
        label: '6 GHz',
        disabled: false
      }
    ]
    const expected = [
      {
        index: 0,
        name: 'enable24G',
        value: true,
        label: '2.4 GHz',
        disabled: false
      },
      {
        index: 1,
        name: 'enable50G',
        value: false,
        label: '5 GHz',
        disabled: false
      },
      {
        index: 2,
        name: 'enable6G',
        value: false,
        label: '6 GHz',
        disabled: false
      }
    ]
    const actual = inverseTargetValue(target, options)
    expect(actual).toEqual(expected)
  })
})

describe('test getWlanSecurity func', () => {
  it('should return WlanSecurityEnum.WPA3 when wlan.wlanSecurity is WPA3', function () {
    const mockWlanData = {
      name: 'test',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3
      }
    } as NetworkSaveData

    const actual = getWlanSecurity(mockWlanData)
    expect(actual).toBe(WlanSecurityEnum.WPA3)
  })

  it('should return WlanSecurityEnum.WPA3 when wlanSecurity is WPA3', function () {
    const mockWlanData = {
      name: 'test',
      wlanSecurity: WlanSecurityEnum.WPA3
    } as NetworkSaveData

    const actual = getWlanSecurity(mockWlanData)
    expect(actual).toBe(WlanSecurityEnum.WPA3)
  })

  it('should return undefined when both wlanSecurity and wlan.wlanSecurity are undefined', function () {
    const mockWlanData = {
      name: 'test',
      wlanSecurity: undefined
    } as NetworkSaveData

    const actual = getWlanSecurity(mockWlanData)
    expect(actual).toBe(undefined)
  })
})

describe('test getIsOwe func', () => {
  it('should return true when enableOwe is true', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: true
    } as NetworkSaveData
    const wlanSecurity = undefined

    const actual = getIsOwe(mockWlanData, wlanSecurity)
    expect(actual).toBe(true)
  })

  it('should return false when enableOwe is false', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: false
    } as NetworkSaveData
    const wlanSecurity = undefined

    const actual = getIsOwe(mockWlanData, wlanSecurity)
    expect(actual).toBe(false)
  })

  it('should return true when enableOwe is undefined and wlanSecurity is OWE', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: undefined
    } as NetworkSaveData
    const wlanSecurity = WlanSecurityEnum.OWE

    const actual = getIsOwe(mockWlanData, wlanSecurity)
    expect(actual).toBe(true)
  })

  it('should return false when enableOwe is undefined and wlanSecurity is not OWE', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: undefined
    } as NetworkSaveData
    const wlanSecurity = WlanSecurityEnum.Open

    const actual = getIsOwe(mockWlanData, wlanSecurity)
    expect(actual).toBe(false)
  })
})
