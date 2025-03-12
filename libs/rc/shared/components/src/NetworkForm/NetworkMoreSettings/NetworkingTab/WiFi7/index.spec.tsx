/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { useIsSplitOn, useIsTierAllowed, Features } from '@acx-ui/feature-toggle'
import { NetworkSaveData, WlanSecurityEnum }        from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { fireEvent, render, screen, within }        from '@acx-ui/test-utils'

import { MLOContext }                                 from '../../../NetworkForm'
import NetworkFormContext, { NetworkFormContextType } from '../../../NetworkFormContext'

import {
  disabledUnCheckOption,
  enableAllRadioCheckboxes,
  getInitMloOptions,
  getIsOwe,
  inverseTargetValue,
  isEnableOptionOf6GHz
} from './utils'

import WiFi7 from '.'

jest.mock('../../../../ApCompatibility', () => ({
  ...jest.requireActual('../../../../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

describe('test WiFi7', () => {
  it('should render correctly when FF true when creating a network', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7/>
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

  it('should switch enable wifi toggle correctly', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7/>
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

  it('should not render MLO field item render when useIsSplitOn return false (all feature flags off)', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7/>
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

  it('should maintain checkbox status when switching mlo toggle off', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_EDA_WIFI7_MLO_3LINK_TOGGLE)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7/>
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
    expect(checkboxElement[0]).not.toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()

    await userEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()

    await userEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    expect(checkboxElement[0]).not.toBeChecked()
    expect(checkboxElement[1]).toBeChecked()
    expect(checkboxElement[2]).not.toBeChecked()
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
})

describe('test MLO_3LINK FF functions and components', () => {
  describe('MLO_3LINK FF off', () => {
    it('should show default checkboxGroup when switching enable MLO toggle and FF is off', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_EDA_WIFI7_MLO_3LINK_TOGGLE)
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      const mockAddNetworkEnabled6GHz = {
        name: 'mockAddNetworkEnabled6GHz',
        type: 'psk',
        isCloudpathEnabled: false,
        venues: [],
        enableAccountingProxy: false,
        enableAuthProxy: false,
        enableAccountingService: false,
        wlan: {
          ssid: 'mockAddNetworkEnabled6GHz',
          wlanSecurity: 'WPA3',
          managementFrameProtection: 'Required'
        }
      }

      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: mockAddNetworkEnabled6GHz
          } as NetworkFormContextType}>
            <Form>
              <WiFi7 />
            </Form>
          </NetworkFormContext.Provider>
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
    })

    it('should (1) show error msg (2) enable options when selected less than two and FF is off', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_EDA_WIFI7_MLO_3LINK_TOGGLE)
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: {
              name: 'test',
              type: 'open',
              wlan: {
                wlanSecurity: WlanSecurityEnum.WPA3
              }
            } as NetworkSaveData
          } as NetworkFormContextType}>
            <Form>
              <WiFi7 />
            </Form>
          </NetworkFormContext.Provider>
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
      expect(await screen.findByText('Please select at least two radios')).toBeVisible()
      expect(checkboxElement[0]).not.toBeChecked()
      expect(checkboxElement[1]).toBeChecked()
      expect(checkboxElement[2]).not.toBeChecked()
      expect(checkboxElement[2]).not.toBeDisabled()

      fireEvent.click(checkboxElement[0])
      expect(checkboxElement[0]).toBeChecked()
      expect(checkboxElement[1]).toBeChecked()
      expect(checkboxElement[2]).not.toBeChecked()
      expect(checkboxElement[2]).toBeDisabled()
    })

    describe('test handleDisabledUnCheckOption func', () => {
      it('should disable the uncheck option and return new state of options correctly when FF is off', function () {
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
      it('should enable all of options when FF is off', function () {
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

    describe('test getInitMloOptions func', () => {
      it('create network: should return the default when the initial mlo options is undefined and FF is off.',() => {
        const MLO_3_LINK_FF = false
        const mockMloOptions = undefined

        const expected = {
          enable24G: true,
          enable50G: true,
          enable6G: false
        }
        const actual = getInitMloOptions(mockMloOptions, MLO_3_LINK_FF)
        expect(actual).toEqual(expected)
      })
      it('edit network: should return the same value that matches the mlo options data when FF is off.', () => {
        const MLO_3_LINK_FF = false
        const mockMloOptions = {
          enable24G: true,
          enable50G: true,
          enable6G: false
        }
        const expected = {
          enable24G: true,
          enable50G: true,
          enable6G: false
        }
        const actual = getInitMloOptions(mockMloOptions, MLO_3_LINK_FF)
        expect(actual).toEqual(expected)
      })
    })
  })
  describe('MLO_3_LINK FF on', () => {
    it('should show default checkboxGroup when switching enable MLO toggle and FF is on',async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      const mockAddNetworkEnabled6GHz = {
        name: 'mockAddNetworkEnabled6GHz',
        type: 'psk',
        isCloudpathEnabled: false,
        venues: [],
        enableAccountingProxy: false,
        enableAuthProxy: false,
        enableAccountingService: false,
        wlan: {
          ssid: 'mockAddNetworkEnabled6GHz',
          wlanSecurity: 'WPA3',
          managementFrameProtection: 'Required'
        }
      }

      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: mockAddNetworkEnabled6GHz
          } as NetworkFormContextType}>
            <Form>
              <WiFi7 />
            </Form>
          </NetworkFormContext.Provider>
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
      expect(checkboxElement[2]).toBeChecked()
    })

    it('should (1) show error msg (2) not show disabled option when selected less than two and FF is on', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: {
              name: 'test',
              type: 'open',
              wlan: {
                wlanSecurity: WlanSecurityEnum.WPA3
              }
            } as NetworkSaveData
          } as NetworkFormContextType}>
            <Form>
              <WiFi7 />
            </Form>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: { params }
        }
      )

      const switchElements = screen.getAllByRole('switch')
      expect(switchElements.length).toBe(2)
      expect(switchElements[0]).toBeChecked()
      expect(switchElements[1]).not.toBeChecked()
      fireEvent.click(switchElements[1])
      expect(switchElements[0]).toBeChecked()
      expect(switchElements[1]).toBeChecked()

      const checkboxElement = screen.getAllByRole('checkbox')
      expect(checkboxElement.length).toBe(3)
      expect(checkboxElement[0]).toBeChecked()
      expect(checkboxElement[1]).toBeChecked()
      expect(checkboxElement[2]).toBeChecked()
      expect(checkboxElement[2]).not.toBeDisabled()

      await userEvent.click(checkboxElement[0])
      await userEvent.click(checkboxElement[2])
      expect(await screen.findByText('Please select at least two radios')).toBeVisible()
      expect(checkboxElement[0]).not.toBeChecked()
      expect(checkboxElement[1]).toBeChecked()
      expect(checkboxElement[2]).not.toBeChecked()

      fireEvent.click(checkboxElement[0])
      expect(checkboxElement[0]).toBeChecked()
      expect(checkboxElement[1]).toBeChecked()
      expect(checkboxElement[2]).not.toBeChecked()
      expect(checkboxElement[2]).not.toBeDisabled()
    })

    it('should show R370 comopatibility tooltip when FF is on', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      const mockAddNetworkEnabled6GHz = {
        name: 'mockAddNetworkEnabled6GHz',
        type: 'psk',
        isCloudpathEnabled: false,
        venues: [],
        enableAccountingProxy: false,
        enableAuthProxy: false,
        enableAccountingService: false,
        wlan: {
          ssid: 'mockAddNetworkEnabled6GHz',
          wlanSecurity: 'WPA3',
          managementFrameProtection: 'Required'
        }
      }

      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: mockAddNetworkEnabled6GHz
          } as NetworkFormContextType}>
            <Form>
              <WiFi7 />
            </Form>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: { params }
        }
      )

      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
    })

    describe('test getInitMloOptions func', () => {
      it('create network: should return the default when the initial MLO options is undefined and FF is on.', () => {
        const MLO_3_LINK_FF = true
        const mockMloOptions = undefined

        const expected = {
          enable24G: true,
          enable50G: true,
          enable6G: true
        }

        const actual = getInitMloOptions(mockMloOptions, MLO_3_LINK_FF)
        expect(actual).toEqual(expected)
      })

      it('edit network: should return the same value that matches the MLO options data when FF is on.', () => {
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
        const actual = getInitMloOptions(mockMloOptions, true)
        expect(actual).toEqual(expected)
      })
    })
  })
})

describe('test wlanSecurity', () => {
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

  it('should disable Multi-Link toggle button on OWE transaction network', async function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          isRuckusAiMode: false,
          data: {
            name: 'test',
            type: 'open',
            wlan: {
              wlanSecurity: WlanSecurityEnum.OWETransition
            }
          } as NetworkSaveData
        } as NetworkFormContextType}>
          <MLOContext.Provider value={{
            isDisableMLO: true,
            disableMLO: jest.fn()
          }}>
            <Form>
              <WiFi7 />
            </Form>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>

      </Provider>, {
        route: { params }
      }
    )

    const switchElement = await screen.findByTestId('mlo-switch-1')
    expect(switchElement).toBeDisabled()
  })

  it('should disable Multi-Link toggle button on DPSK network', async function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          isRuckusAiMode: false,
          data: {
            name: 'test',
            type: 'dpsk',
            wlan: {
              wlanSecurity: WlanSecurityEnum.WPA2Personal
            }
          } as NetworkSaveData
        } as NetworkFormContextType}>
          <MLOContext.Provider value={{
            isDisableMLO: true,
            disableMLO: jest.fn()
          }}>
            <Form>
              <WiFi7 />
            </Form>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>

      </Provider>, {
        route: { params }
      }
    )

    const switchElement = await screen.findByTestId('mlo-switch-1')
    expect(switchElement).toBeDisabled()
  })

  it('should disable Multi-Link toggle button on OPEN network', async function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          isRuckusAiMode: false,
          data: {
            name: 'test',
            type: 'open',
            wlan: {
              wlanSecurity: WlanSecurityEnum.Open
            }
          } as NetworkSaveData
        } as NetworkFormContextType}>
          <MLOContext.Provider value={{
            isDisableMLO: true,
            disableMLO: jest.fn()
          }}>
            <Form>
              <WiFi7 />
            </Form>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>

      </Provider>, {
        route: { params }
      }
    )

    const switchElement = await screen.findByTestId('mlo-switch-1')
    expect(switchElement).toBeDisabled()
  })

  it('should not disable Multi-Link toggle button on OWE network', async function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          isRuckusAiMode: false,
          data: {
            name: 'test',
            type: 'open',
            wlan: {
              wlanSecurity: WlanSecurityEnum.OWE
            }
          } as NetworkSaveData
        } as NetworkFormContextType}>
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <Form>
              <WiFi7 />
            </Form>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>

      </Provider>, {
        route: { params }
      }
    )

    const switchElement = await screen.findByTestId('mlo-switch-2')
    expect(switchElement).not.toBeDisabled()
  })
})
