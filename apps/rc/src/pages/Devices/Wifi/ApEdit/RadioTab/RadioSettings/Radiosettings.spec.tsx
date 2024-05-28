/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { apApi, venueApi }        from '@acx-ui/rc/services'
import {
  AFCPowerMode,
  AFCStatus,
  ApRadioCustomization,
  ApRadioParams24G,
  ApRadioParams50G,
  ApRadioParams6G,
  CommonUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { cleanup, mockServer, render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom'


import { ApDataContext, ApEditContext } from '../..'
import {
  apDeviceRadio,
  apR760DeviceRadio,
  r560Ap,
  r760Ap,
  triBandApCap,
  validRadioChannels,
  venuelist,
  venueRadioCustomization,
  venueRadioDetail
} from '../../../../__tests__/fixtures'

import {
  applySettings,
  applyState,
  createCacheSettings,
  extractStateOfIsUseVenueSettings,
  getRadioTypeDisplayName,
  isCurrentTabUseVenueSettings,
  isUseVenueSettings,
  RadioSettings,
  RadioType,
  StateOfIsUseVenueSettings,
  toggleState
} from './RadioSettings'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760')
const r560Cap = triBandApCap.apModels.find(cap => cap.model === 'R560')

describe('RadioSettingsTab', ()=> {
  describe('RadioSettingsTab with R560 AP', () => {
    beforeEach(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          CommonUrlsInfo.getDashboardOverview.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(
          CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuelist))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueRadioDetail))),
        rest.get(
          WifiUrlsInfo.getApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(apDeviceRadio))),
        rest.get(
          WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiUrlsInfo.getApValidChannel.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
        rest.put(
          WifiUrlsInfo.updateApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.delete(
          WifiUrlsInfo.deleteApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({}))),
        // rbac
        rest.get(
          WifiRbacUrlsInfo.getApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(apDeviceRadio))),
        rest.get(
          WifiRbacUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiRbacUrlsInfo.getApValidChannel.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
        rest.put(
          WifiRbacUrlsInfo.updateApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    xit('should render correctly', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'DFS' }))
      const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
      await userEvent.click(transmitSelect)
      await userEvent.click((await screen.findAllByTitle('Auto'))[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

      //await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    xit('should render correctly with Auto bandwidth', async () => {
      apDeviceRadio.apRadioParams50G.channelBandwidth = 'AUTO'
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'DFS' }))
      const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
      await userEvent.click(transmitSelect)
      await userEvent.click((await screen.findAllByTitle('Auto'))[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))
    })

    xit('should render correctly with 40Mhz bandwidth', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))

      const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
      await userEvent.click(bandwidthSelect)
      expect((await screen.findByTitle('40 MHz'))).toBeDefined()
      await userEvent.click((await screen.findByTitle('40 MHz')))

      await userEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'DFS' }))

      const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
      await userEvent.click(transmitSelect)
      await userEvent.click((await screen.findAllByTitle('Auto'))[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))
    })

    xit('should render correctly with 80Mhz bandwidth', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))

      const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
      await userEvent.click(bandwidthSelect)
      expect((await screen.findByTitle('80 MHz'))).toBeDefined()
      await userEvent.click((await screen.findByTitle('80 MHz')))

      await userEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'DFS' }))
      const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
      await userEvent.click(transmitSelect)
      await userEvent.click((await screen.findAllByTitle('Auto'))[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))
    })

    xit('should render 2.4GHz channels correctly with MANUAL method', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '2.4 GHz' }))
      const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
      expect(channelSelect).not.toHaveAttribute('disabled')
      await userEvent.click(channelSelect)
      expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
      await userEvent.click((await screen.findByTitle('Manual channel selection')))
      await userEvent.click(await screen.findByText('1'))
    })

    xit('should render 5GHz channels correctly with MANUAL method', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))

      const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
      expect(channelSelect).not.toHaveAttribute('disabled')
      await userEvent.click(channelSelect)
      expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
      await userEvent.click((await screen.findByTitle('Manual channel selection')))

      await userEvent.click(await screen.findByText('36'))
    })

    xit('should render 6GHz channels correctly with MANUAL method', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '6 GHz' }))
      // turn On 6G radio
      const enable6GBtn = await screen.findByRole('switch')
      await userEvent.click(enable6GBtn)

      const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
      expect(channelSelect).not.toHaveAttribute('disabled')
      await userEvent.click(channelSelect)
      expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
      await userEvent.click((await screen.findByTitle('Manual channel selection')))

      await userEvent.click(await screen.findByText('21'))
    })

    xit('should render correctly with disable 2.4G', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '2.4 GHz' }))

      const enable24GBtn = await screen.findByRole('switch')
      await userEvent.click(enable24GBtn)

      await screen.findByText('2.4 GHz Radio is disabled')
    })

    xit('should render correctly with disable 5G', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))

      const enable5GBtn = await screen.findByRole('switch')
      await userEvent.click(enable5GBtn)

      await screen.findByText('5 GHz Radio is disabled')
    })

    xit('should render correctly with disable 6G', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '6 GHz' }))

      await screen.findByText('6 GHz Radio is disabled')

      const enable6GBtn = await screen.findByRole('switch')
      await userEvent.click(enable6GBtn)
    })

    xit('should render correctly with Customize or Use Venue Settings', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))

      await screen.findByRole('button', { name: 'Use Venue Settings' })
    })

    it('should render correctly with cancel action', async () => {
      apDeviceRadio.apRadioParams50G.channelBandwidth = 'AUTO'
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            apViewContextData: {
              apStatusData: {
                afcInfo: {
                  afcStatus: AFCStatus.PASSED,
                  powerMode: AFCPowerMode.STANDARD_POWER
                }
              }
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r560Ap,
              apCapabilities: r560Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })

  })

  describe('RadioSettingsTab with R760 AP', () => {
    beforeEach(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          CommonUrlsInfo.getDashboardOverview.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(
          CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuelist))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueRadioDetail))),
        //rest.get(
        //  WifiUrlsInfo.getAp.url,
        //  (_, res, ctx) => res(ctx.json(r760Ap))),
        //rest.get(
        //  WifiUrlsInfo.getApCapabilities.url,
        //  (_, res, ctx) => res(ctx.json(triBandApCap))),
        rest.get(
          WifiUrlsInfo.getApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(apR760DeviceRadio))),
        rest.get(
          WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiUrlsInfo.getApValidChannel.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
        rest.put(
          WifiUrlsInfo.updateApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({}))),
        // rbac
        rest.get(
          WifiRbacUrlsInfo.getApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(apR760DeviceRadio))),
        rest.get(
          WifiRbacUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiRbacUrlsInfo.getApValidChannel.url,
          (_, res, ctx) => res(ctx.json(validRadioChannels))),
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
        rest.put(
          WifiRbacUrlsInfo.updateApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    xit('should render correctly', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r760Ap,
              apCapabilities: r760Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
      await userEvent.click(await screen.findByRole('button', { name: 'DFS' }))
      const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
      await userEvent.click(transmitSelect)
      await userEvent.click((await screen.findAllByTitle('Auto'))[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))
    })

    it('should render correctly when tri-band type is dual5G mode', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_SWITCHABLE_RF_TOGGLE)
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            apViewContextData: {
              apStatusData: {
                afcInfo: {
                  afcStatus: AFCStatus.PASSED,
                  powerMode: AFCPowerMode.STANDARD_POWER
                }
              }
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r760Ap,
              apCapabilities: r760Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await screen.findByRole('tab', { name: '2.4 GHz' })

      const dual5GBtn = await screen.findByRole('radio',
        { name: /Split 5GHz into lower and upper bands/ })
      await userEvent.click(dual5GBtn)

      const low5gTab = await screen.findByRole('tab', { name: 'Lower 5 GHz' })
      await userEvent.click(low5gTab)

      const up5gTab = await screen.findByRole('tab', { name: 'Upper 5 GHz' })
      await userEvent.click(up5gTab)
    })

    xit('should render correctly with disable lower 5G', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r760Ap,
              apCapabilities: r760Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      const dual5GBtn = await screen.findByRole('radio',
        { name: /Split 5GHz into lower and upper bands/ })
      await userEvent.click(dual5GBtn)

      const low5gTab = await screen.findByRole('tab', { name: 'Lower 5 GHz' })
      await userEvent.click(low5gTab)

      const enableLower5GBtn = await screen.findByRole('switch')
      await userEvent.click(enableLower5GBtn)

      await screen.findByText('Lower 5 GHz Radio is disabled')
    })

    xit('should render correctly with disable upper 5G', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn()
          }}
          >
            <ApDataContext.Provider value={{
              apData: r760Ap,
              apCapabilities: r760Cap
            }}>
              <RadioSettings />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      const dual5GBtn = await screen.findByRole('radio',
        { name: /Split 5GHz into lower and upper bands/ })
      await userEvent.click(dual5GBtn)

      const up5gTab = await screen.findByRole('tab', { name: 'Upper 5 GHz' })
      await userEvent.click(up5gTab)

      const enableUpper5GBtn = await screen.findByRole('switch')
      await userEvent.click(enableUpper5GBtn)

      await screen.findByText('Upper 5 GHz Radio is disabled')
    })
  })
})

describe('test getRadioTypeDisplayName func', () => {
  it('should return correctly', function () {
    const actualA = getRadioTypeDisplayName(RadioType.Normal24GHz)
    const actualB = getRadioTypeDisplayName(RadioType.Normal5GHz)
    const actualC = getRadioTypeDisplayName(RadioType.Normal6GHz)
    const actualD = getRadioTypeDisplayName(RadioType.Lower5GHz)
    const actualE = getRadioTypeDisplayName(RadioType.Upper5GHz)

    expect(actualA).toBe('2.4 GHz')
    expect(actualB).toBe('5 GHz')
    expect(actualC).toBe('6 GHz')
    expect(actualD).toBe('Lower 5 GHz')
    expect(actualE).toBe('Upper 5 GHz')
  })
})

describe('test isCurrentTabUseVenueSettings func', () => {
  it('should return value of isUseVenueSettings24G when isEnablePerApRadioCustomizationFlag is true', function () {
    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }

    const type = RadioType.Normal24GHz

    const actualA = isCurrentTabUseVenueSettings(stateA, type)
    const actualB = isCurrentTabUseVenueSettings(stateB, type)

    expect(actualA).toBe(stateA.isUseVenueSettings24G)
    expect(actualB).toBe(stateB.isUseVenueSettings24G)
  })
  it('should return value of isUseVenueSettings5G when isEnablePerApRadioCustomizationFlag is true', function () {
    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }

    const type = RadioType.Normal5GHz

    const actualA = isCurrentTabUseVenueSettings(stateA, type)
    const actualB = isCurrentTabUseVenueSettings(stateB, type)

    expect(actualA).toBe(stateA.isUseVenueSettings5G)
    expect(actualB).toBe(stateB.isUseVenueSettings5G)
  })
  it('should return value of isUseVenueSettings6G when isEnablePerApRadioCustomizationFlag is true', function () {
    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false
    }

    const type = RadioType.Normal6GHz

    const actualA = isCurrentTabUseVenueSettings(stateA, type)
    const actualB = isCurrentTabUseVenueSettings(stateB, type)

    expect(actualA).toBe(stateA.isUseVenueSettings6G)
    expect(actualB).toBe(stateB.isUseVenueSettings6G)
  })
  it('should return value of isUseVenueSettingsLower5G when isEnablePerApRadioCustomizationFlag is true', function () {
    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: true
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: false
    }

    const type = RadioType.Lower5GHz

    const actualA = isCurrentTabUseVenueSettings(stateA, type)
    const actualB = isCurrentTabUseVenueSettings(stateB, type)

    expect(actualA).toBe(stateA.isUseVenueSettingsLower5G)
    expect(actualB).toBe(stateB.isUseVenueSettingsLower5G)
  })
  it('should return value of isUseVenueSettingsUpper5G when isEnablePerApRadioCustomizationFlag is true', function () {
    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: false
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: true
    }

    const type = RadioType.Upper5GHz

    const actualA = isCurrentTabUseVenueSettings(stateA, type)
    const actualB = isCurrentTabUseVenueSettings(stateB, type)

    expect(actualA).toBe(stateA.isUseVenueSettingsUpper5G)
    expect(actualB).toBe(stateB.isUseVenueSettingsUpper5G)
  })
})

describe('test isUseVenueSettings func', () => {
  it('should return correctly when isEnablePerApRadioCustomizationFlag is true', function () {
    const settings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const actualA = isUseVenueSettings(settings, RadioType.Normal24GHz)
    const actualB = isUseVenueSettings(settings, RadioType.Normal5GHz)
    const actualC = isUseVenueSettings(settings, RadioType.Normal6GHz)
    const actualD = isUseVenueSettings(settings, RadioType.Lower5GHz)
    const actualE = isUseVenueSettings(settings, RadioType.Upper5GHz)

    expect(actualA).toEqual(settings.apRadioParams24G.useVenueSettings)
    expect(actualB).toEqual(settings.apRadioParams50G?.useVenueSettings)
    expect(actualC).toEqual(settings.apRadioParams6G?.useVenueSettings)
    expect(actualD).toEqual(settings.apRadioParamsDual5G?.radioParamsLower5G?.useVenueSettings)
    expect(actualE).toEqual(settings.apRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings)
  })
})

describe('test extractStateOfIsUseVenueSettings func', () => {
  it('should return correctly', function () {
    const apRadioCustomizationA: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const apRadioCustomizationB: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const apRadioCustomizationC: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const apRadioCustomizationD: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const apRadioCustomizationE: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: false },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const apRadioCustomizationF: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
      }
    }
    const apRadioCustomizationG: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const actualA = extractStateOfIsUseVenueSettings(apRadioCustomizationA)
    const actualB = extractStateOfIsUseVenueSettings(apRadioCustomizationB)
    const actualC = extractStateOfIsUseVenueSettings(apRadioCustomizationC)
    const actualD = extractStateOfIsUseVenueSettings(apRadioCustomizationD)
    const actualE = extractStateOfIsUseVenueSettings(apRadioCustomizationE)
    const actualF = extractStateOfIsUseVenueSettings(apRadioCustomizationF)
    const actualG = extractStateOfIsUseVenueSettings(apRadioCustomizationG)

    const expectedA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const expectedB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const expectedC: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const expectedD: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const expectedE: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: true
    }
    const expectedF: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: false
    }
    const expectedG: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }

    expect(actualA).toEqual(expectedA)
    expect(actualB).toEqual(expectedB)
    expect(actualC).toEqual(expectedC)
    expect(actualD).toEqual(expectedD)
    expect(actualE).toEqual(expectedE)
    expect(actualF).toEqual(expectedF)
    expect(actualG).toEqual(expectedG)
  })
})


describe('test toggleState func', () => {
  it('should toggle StateOfIsUseVenueSetting correctly when isEnablePerApRadioCustomizationFlag is true', function () {
    const isEnablePerApRadioCustomizationFlag = true

    const stateA: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false
    }
    const stateB: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false
    }
    const stateC: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false
    }
    const stateD: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: false
    }
    const stateE: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: true
    }

    const actualA = toggleState(stateA, RadioType.Normal24GHz, isEnablePerApRadioCustomizationFlag)
    const actualB = toggleState(stateB, RadioType.Normal5GHz, isEnablePerApRadioCustomizationFlag)
    const actualC = toggleState(stateC, RadioType.Normal6GHz, isEnablePerApRadioCustomizationFlag)
    const actualD = toggleState(stateD, RadioType.Lower5GHz, isEnablePerApRadioCustomizationFlag)
    const actualE = toggleState(stateE, RadioType.Upper5GHz, isEnablePerApRadioCustomizationFlag)


    expect(actualA).toEqual( {
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false,
      isUseVenueSettings: undefined
    })
    expect(actualB).toEqual({
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false,
      isUseVenueSettings: undefined
    })
    expect(actualC).toEqual({
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false,
      isUseVenueSettings: undefined
    })
    expect(actualD).toEqual({
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false,
      isUseVenueSettings: undefined
    })
    expect(actualE).toEqual({
      isUseVenueSettings24G: false,
      isUseVenueSettings5G: false,
      isUseVenueSettings6G: false,
      isUseVenueSettingsLower5G: false,
      isUseVenueSettingsUpper5G: false,
      isUseVenueSettings: undefined
    })
  })
})

describe('test createCacheSettings func', () => {
  it('should return currentSettings when isEnablePerApRadioCustomizationFlag is false no matter what radio type is', function () {
    const isEnablePerApRadioCustomizationFlag = false
    const currentSettings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const cacheSettings: ApRadioCustomization = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal24GHz, isEnablePerApRadioCustomizationFlag)
    const actualB = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal5GHz, isEnablePerApRadioCustomizationFlag)
    const actualC = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal6GHz, isEnablePerApRadioCustomizationFlag)
    const actualD = createCacheSettings(currentSettings, cacheSettings, RadioType.Lower5GHz, isEnablePerApRadioCustomizationFlag)
    const actualE = createCacheSettings(currentSettings, cacheSettings, RadioType.Upper5GHz, isEnablePerApRadioCustomizationFlag)

    expect(actualA).toEqual(currentSettings)
    expect(actualB).toEqual(currentSettings)
    expect(actualC).toEqual(currentSettings)
    expect(actualD).toEqual(currentSettings)
    expect(actualE).toEqual(currentSettings)
  })
  it('should return correctly when isEnablePerApRadioCustomizationFlag is true', function () {
    const isEnablePerApRadioCustomizationFlag = true
    const currentSettings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const cacheSettings: ApRadioCustomization = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal24GHz, isEnablePerApRadioCustomizationFlag)
    const actualB = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal5GHz, isEnablePerApRadioCustomizationFlag)
    const actualC = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal6GHz, isEnablePerApRadioCustomizationFlag)
    const actualD = createCacheSettings(currentSettings, cacheSettings, RadioType.Lower5GHz, isEnablePerApRadioCustomizationFlag)
    const actualE = createCacheSettings(currentSettings, cacheSettings, RadioType.Upper5GHz, isEnablePerApRadioCustomizationFlag)

    const expectedA = {
      enable24G: true,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const expectedB = {
      enable24G: false,
      enable50G: true,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const expectedC = {
      enable24G: false,
      enable50G: false,
      enable6G: true,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const expectedD = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: true, upper5gEnabled: false,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: undefined
      }
    }

    const expectedE = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    expect(actualA).toEqual(expectedA)
    expect(actualB).toEqual(expectedB)
    expect(actualC).toEqual(expectedC)
    expect(actualD).toEqual(expectedD)
    expect(actualE).toEqual(expectedE)
  })
})

describe('test applySettings func', () => {
  it('should return applySettings when isEnablePerApRadioCustomizationFlag is false no matter what radio type is', function () {
    const isEnablePerApRadioCustomizationFlag = false
    const currentSettings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const updateSettings: ApRadioCustomization = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = applySettings(currentSettings, updateSettings, RadioType.Normal24GHz, isEnablePerApRadioCustomizationFlag)
    const actualB = applySettings(currentSettings, updateSettings, RadioType.Normal5GHz, isEnablePerApRadioCustomizationFlag)
    const actualC = applySettings(currentSettings, updateSettings, RadioType.Normal6GHz, isEnablePerApRadioCustomizationFlag)
    const actualD = applySettings(currentSettings, updateSettings, RadioType.Lower5GHz, isEnablePerApRadioCustomizationFlag)
    const actualE = applySettings(currentSettings, updateSettings, RadioType.Upper5GHz, isEnablePerApRadioCustomizationFlag)

    expect(actualA).toEqual(updateSettings)
    expect(actualB).toEqual(updateSettings)
    expect(actualC).toEqual(updateSettings)
    expect(actualD).toEqual(updateSettings)
    expect(actualE).toEqual(updateSettings)
  })
  it('should return correctly when isEnablePerApRadioCustomizationFlag is true', function () {
    const isEnablePerApRadioCustomizationFlag = true
    const currentSettings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    const updateSettings: ApRadioCustomization = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      useVenueSettings: false,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = applySettings(currentSettings, updateSettings, RadioType.Normal24GHz, isEnablePerApRadioCustomizationFlag)
    const actualB = applySettings(currentSettings, updateSettings, RadioType.Normal5GHz, isEnablePerApRadioCustomizationFlag)
    const actualC = applySettings(currentSettings, updateSettings, RadioType.Normal6GHz, isEnablePerApRadioCustomizationFlag)
    const actualD = applySettings(currentSettings, updateSettings, RadioType.Lower5GHz, isEnablePerApRadioCustomizationFlag)
    const actualE = applySettings(currentSettings, updateSettings, RadioType.Upper5GHz, isEnablePerApRadioCustomizationFlag)

    const expectedA = {
      enable24G: false,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const expectedB = {
      enable24G: true,
      enable50G: false,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const expectedC = {
      enable24G: true,
      enable50G: true,
      enable6G: false,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const expectedD = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: false, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }

    const expectedE = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      useVenueSettings: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: false,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: undefined
      }
    }

    expect(actualA).toEqual(expectedA)
    expect(actualB).toEqual(expectedB)
    expect(actualC).toEqual(expectedC)
    expect(actualD).toEqual(expectedD)
    expect(actualE).toEqual(expectedE)
  })
})

describe('test applyState func', () => {
  it('should apply State correctly', function () {
    const state: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const settings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: false },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
      }
    }

    const actual = applyState(state, settings)
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    expect(actual).toEqual(expected)
  })
  it('should apply State correctly when having undefined value', function () {
    const state: StateOfIsUseVenueSettings = {
      isUseVenueSettings24G: true,
      isUseVenueSettings5G: true,
      isUseVenueSettings6G: true,
      isUseVenueSettingsLower5G: true,
      isUseVenueSettingsUpper5G: true
    }
    const settings: ApRadioCustomization = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
      }
    }

    const actual = applyState(state, settings)
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
      }
    }
    expect(actual).toEqual(expected)
  })
})
