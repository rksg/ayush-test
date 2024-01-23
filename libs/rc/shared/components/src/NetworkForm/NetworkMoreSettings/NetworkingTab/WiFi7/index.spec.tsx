/* eslint-disable max-len */

import { userEvent } from '@storybook/testing-library'
import { within }    from '@testing-library/react'
import { Form }      from 'antd'

import { useIsSplitOn, useIsTierAllowed }    from '@acx-ui/feature-toggle'
import { NetworkSaveData, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen }         from '@acx-ui/test-utils'

import WiFi7, {
  disabledUnCheckOption,
  enableAllRadioCheckboxes, getIsOwe,
  getInitMloOptions,
  inverseTargetValue,
  isEnableOptionOf6GHz
} from '.'

describe('WiFi7', () => {
  it('should render correctly when useIsSplitOn return true', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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

  it('should return true when the wlanSecurity is WPA23Mixed of dpsk network', function () {
    const mockWlanData = {
      name: 'test',
      type: 'dpsk',
      wlan: {
        wlanSecurity: 'WPA23Mixed'
      }
    } as NetworkSaveData

    const actual = isEnableOptionOf6GHz(mockWlanData)
    expect(actual).toBe(true)
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
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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

describe('test getIsOwe func', () => {
  it('should return true when enableOwe is true', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: true
    } as NetworkSaveData

    const actual = getIsOwe(mockWlanData)
    expect(actual).toBe(true)
  })

  it('should return false when enableOwe is false', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: false
    } as NetworkSaveData

    const actual = getIsOwe(mockWlanData)
    expect(actual).toBe(false)
  })

  it('should return true when enableOwe is undefined and wlanSecurity is OWE', function () {
    const mockWlanData = {
      name: 'test',
      enableOwe: undefined,
      networkSecurity: WlanSecurityEnum.OWE
    } as NetworkSaveData

    const actual = getIsOwe(mockWlanData)
    expect(actual).toBe(true)
  })
})
