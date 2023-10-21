/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { apApi, venueApi } from '@acx-ui/rc/services'
import {
  ApRadioCustomization,
  ApRadioParams24G,
  ApRadioParams50G,
  ApRadioParams6G,
  CommonUrlsInfo,
  getUrlForTest,
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
  HandlerOfNewVersion24G,
  HandlerOfNewVersion5G,
  HandlerOfNewVersion6G,
  HandlerOfNewVersionLower5G,
  HandlerOfNewVersionUpper5G,
  HandlerOfOldVersion,
  RadioSettings,
  StateOfIsUseVenueSettings, StateOfIsUseVenueSettingsHandler,
  StateOfIsUseVenueSettingsHandlerFactory,
  Type
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
        rest.get(
          getUrlForTest(CommonUrlsInfo.getVenue),
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
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    it('should render correctly', async () => {
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

    it('should render correctly with Auto bandwidth', async () => {
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

    it('should render correctly with 40Mhz bandwidth', async () => {
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

    it('should render correctly with 80Mhz bandwidth', async () => {
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

    it('should render 2.4GHz channels correctly with MANUAL method', async () => {
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

    it('should render 5GHz channels correctly with MANUAL method', async () => {
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

    it('should render 6GHz channels correctly with MANUAL method', async () => {
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

    it('should render correctly with disable 2.4G', async () => {
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

    it('should render correctly with disable 5G', async () => {
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

    it('should render correctly with disable 6G', async () => {
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
        rest.get(
          getUrlForTest(CommonUrlsInfo.getVenue),
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
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    it('should render correctly', async () => {
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

      await screen.findByRole('tab', { name: '2.4 GHz' })

      const dual5GBtn = await screen.findByRole('radio',
        { name: /Split 5GHz into lower and upper bands/ })
      await userEvent.click(dual5GBtn)

      const low5gTab = await screen.findByRole('tab', { name: 'Lower 5 GHz' })
      await userEvent.click(low5gTab)

      const up5gTab = await screen.findByRole('tab', { name: 'Upper 5 GHz' })
      await userEvent.click(up5gTab)
    })

    it('should render correctly with disable lower 5G', async () => {
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

    it('should render correctly with disable upper 5G', async () => {
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

describe('StateOfIsUseVenueSettingsHandlerFactory', () => {
  describe('test getInstance func', function () {
    it('should return handlerOfOldVersion when isEnablePerApRadioCustomizationFlag is false', function () {
      const isEnablePerApRadioCustomizationFlag = false

      const actualA = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal24GHz, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal5GHz, isEnablePerApRadioCustomizationFlag)
      const actualC = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal6GHz, isEnablePerApRadioCustomizationFlag)
      const actualD = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Lower5GHz, isEnablePerApRadioCustomizationFlag)
      const actualE = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Upper5GHz, isEnablePerApRadioCustomizationFlag)
      const actualF = StateOfIsUseVenueSettingsHandlerFactory.getInstance('aaa' as Type, isEnablePerApRadioCustomizationFlag)

      const expected = new HandlerOfOldVersion()
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(expected)
      expect(actualC).toEqual(expected)
      expect(actualD).toEqual(expected)
      expect(actualE).toEqual(expected)
      expect(actualF).toEqual(expected)
    })
    it('should return correctly when isEnablePerApRadioCustomizationFlag is true', function () {
      const isEnablePerApRadioCustomizationFlag = true

      const actualA = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal24GHz, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal5GHz, isEnablePerApRadioCustomizationFlag)
      const actualC = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal6GHz, isEnablePerApRadioCustomizationFlag)
      const actualD = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Lower5GHz, isEnablePerApRadioCustomizationFlag)
      const actualE = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Upper5GHz, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toEqual(new HandlerOfNewVersion24G())
      expect(actualB).toEqual(new HandlerOfNewVersion5G())
      expect(actualC).toEqual(new HandlerOfNewVersion6G())
      expect(actualD).toEqual(new HandlerOfNewVersionLower5G())
      expect(actualE).toEqual(new HandlerOfNewVersionUpper5G())
    })
    it('should return NULL when type is not matched and isEnablePerApRadioCustomizationFlag is true', function () {
      const actual = StateOfIsUseVenueSettingsHandlerFactory.getInstance('aaa' as Type, true)

      expect(actual).toBeNull()
    })
    it('should return same instance', function () {
      const actualA = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal24GHz, true)
      const actualB = StateOfIsUseVenueSettingsHandlerFactory.getInstance(Type.Normal24GHz, true)

      expect(actualA === actualB).toBe(true)
    })
  })
})

describe('StateOfIsUseVenueSettingsHandler', () => {
  describe('test summarizedIsUseVenueSettings func', () => {
    it('should return isUseVenueSettings is false when any of isUseVenueSettings24G, isUseVenueSettings5G, isUseVenueSettingsLower5G, isUseVenueSettingsUpper5G, isUseVenueSettings6G is false, no matter what the value of isUseVenueSettings is', function () {
      const stateA = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: undefined
      }
      const stateB = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: false
      }
      const stateC = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: true
      }

      const actualA = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateA)
      const actualB = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateB)
      const actualC = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateC)

      expect(actualA.isUseVenueSettings).toBe(false)
      expect(actualB.isUseVenueSettings).toBe(false)
      expect(actualC.isUseVenueSettings).toBe(false)
    })
    it('should return isUseVenueSettings is true only when isUseVenueSettings24G, isUseVenueSettings5G, isUseVenueSettingsLower5G, isUseVenueSettingsUpper5G, isUseVenueSettings6G all are true, no matter what the value of isUseVenueSettings is', function () {
      const stateA = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: undefined
      }
      const stateB = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: false
      }
      const stateC = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: true
      }

      const actualA = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateA)
      const actualB = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateB)
      const actualC = StateOfIsUseVenueSettingsHandler.summarizedIsUseVenueSettings(stateC)

      expect(actualA.isUseVenueSettings).toBe(true)
      expect(actualB.isUseVenueSettings).toBe(true)
      expect(actualC.isUseVenueSettings).toBe(true)
    })
  })
  describe('test applyState func', () => {
    it('should return correctly', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const apRadioParams60G = new ApRadioParams6G()
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: true
      }
      const data: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: true },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: true },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: false },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: true },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }

      const actual = StateOfIsUseVenueSettingsHandler.applyState(state, data)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: false },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: false },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: false }
        }
      }
      expect(actual).toEqual(expected)
    })
    it('should return correctly when having undefined value', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: true
      }
      const data: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }

      const actual = StateOfIsUseVenueSettingsHandler.applyState(state, data)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: false }
        }
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test getStateOfIsUseVenueSettings func', () => {
    it('should return correctly when isEnablePerApRadioCustomizationFlag is false', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const apRadioParams60G = new ApRadioParams6G()

      const apRadioCustomization: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: true },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: true },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }
      const isEnablePerApRadioCustomizationFlag = false

      const actual =
        StateOfIsUseVenueSettingsHandler.getStateOfIsUseVenueSettings(apRadioCustomization, isEnablePerApRadioCustomizationFlag)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
    it('should return correctly when isEnablePerApRadioCustomizationFlag is true', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const apRadioParams60G = new ApRadioParams6G()

      const apRadioCustomization: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: true },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: true },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }
      const isEnablePerApRadioCustomizationFlag = true

      const actual =
        StateOfIsUseVenueSettingsHandler.getStateOfIsUseVenueSettings(apRadioCustomization, isEnablePerApRadioCustomizationFlag)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
    it('should return correctly (the undefined value should be the same with outer useVenueSettings) when isEnablePerApRadioCustomizationFlag is true and has undefined value and isUseVenueSettings is false', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const apRadioParams60G = new ApRadioParams6G()

      const apRadioCustomization: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: undefined },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: true },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }
      const isEnablePerApRadioCustomizationFlag = true

      const actual =
        StateOfIsUseVenueSettingsHandler.getStateOfIsUseVenueSettings(apRadioCustomization, isEnablePerApRadioCustomizationFlag)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
    it('should return correctly (the undefined value should be the same with outer useVenueSettings) when isEnablePerApRadioCustomizationFlag is true and has undefined value and isUseVenueSettings is true', function () {
      const apRadioParams24G = new ApRadioParams24G()
      const apRadioParams50G = new ApRadioParams50G()
      const apRadioParams60G = new ApRadioParams6G()

      const apRadioCustomization: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...apRadioParams24G, useVenueSettings: false },
        apRadioParams50G: { ...apRadioParams50G, useVenueSettings: undefined },
        apRadioParams6G: { ...apRadioParams60G, useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...apRadioParams50G, useVenueSettings: true },
          radioParamsUpper5G: { ...apRadioParams50G, useVenueSettings: true }
        }
      }
      const isEnablePerApRadioCustomizationFlag = true

      const actual =
        StateOfIsUseVenueSettingsHandler.getStateOfIsUseVenueSettings(apRadioCustomization, isEnablePerApRadioCustomizationFlag)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isCurrentTabUseVenueSettings func', () => {
    it('should return value of isUseVenueSettings when isEnablePerApRadioCustomizationFlag is false', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }
      const typeNormal24GHz = Type.Normal24GHz
      const typeNormal5GHz = Type.Normal5GHz
      const typeNormal6GHz = Type.Normal6GHz
      const typeLower5GHz = Type.Lower5GHz
      const typeUpper5GHz = Type.Upper5GHz
      const isEnablePerApRadioCustomizationFlag = false

      const actualAA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, typeNormal24GHz, isEnablePerApRadioCustomizationFlag)
      const actualAB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, typeNormal5GHz, isEnablePerApRadioCustomizationFlag)
      const actualAC = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, typeNormal6GHz, isEnablePerApRadioCustomizationFlag)
      const actualAD = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, typeLower5GHz, isEnablePerApRadioCustomizationFlag)
      const actualAE = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, typeUpper5GHz, isEnablePerApRadioCustomizationFlag)
      const actualBA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, typeNormal24GHz, isEnablePerApRadioCustomizationFlag)
      const actualBB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, typeNormal5GHz, isEnablePerApRadioCustomizationFlag)
      const actualBC = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, typeNormal6GHz, isEnablePerApRadioCustomizationFlag)
      const actualBD = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, typeLower5GHz, isEnablePerApRadioCustomizationFlag)
      const actualBE = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, typeUpper5GHz, isEnablePerApRadioCustomizationFlag)

      expect(actualAA).toBe(stateA.isUseVenueSettings)
      expect(actualAB).toBe(stateA.isUseVenueSettings)
      expect(actualAC).toBe(stateA.isUseVenueSettings)
      expect(actualAD).toBe(stateA.isUseVenueSettings)
      expect(actualAE).toBe(stateA.isUseVenueSettings)
      expect(actualBA).toBe(stateB.isUseVenueSettings)
      expect(actualBB).toBe(stateB.isUseVenueSettings)
      expect(actualBC).toBe(stateB.isUseVenueSettings)
      expect(actualBD).toBe(stateB.isUseVenueSettings)
      expect(actualBE).toBe(stateB.isUseVenueSettings)
    })
    it('should return value of isUseVenueSettings24G when isEnablePerApRadioCustomizationFlag is true', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const isEnablePerApRadioCustomizationFlag = true
      const type = Type.Normal24GHz

      const actualA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, type, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, type, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toBe(stateA.isUseVenueSettings24G)
      expect(actualB).toBe(stateB.isUseVenueSettings24G)
    })
    it('should return value of isUseVenueSettings5G when isEnablePerApRadioCustomizationFlag is true', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const isEnablePerApRadioCustomizationFlag = true
      const type = Type.Normal5GHz

      const actualA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, type, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, type, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toBe(stateA.isUseVenueSettings5G)
      expect(actualB).toBe(stateB.isUseVenueSettings5G)
    })
    it('should return value of isUseVenueSettings6G when isEnablePerApRadioCustomizationFlag is true', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const isEnablePerApRadioCustomizationFlag = true
      const type = Type.Normal6GHz

      const actualA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, type, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, type, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toBe(stateA.isUseVenueSettings6G)
      expect(actualB).toBe(stateB.isUseVenueSettings6G)
    })
    it('should return value of isUseVenueSettingsLower5G when isEnablePerApRadioCustomizationFlag is true', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const isEnablePerApRadioCustomizationFlag = true
      const type = Type.Lower5GHz

      const actualA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, type, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, type, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toBe(stateA.isUseVenueSettingsLower5G)
      expect(actualB).toBe(stateB.isUseVenueSettingsLower5G)
    })
    it('should return value of isUseVenueSettingsUpper5G when isEnablePerApRadioCustomizationFlag is true', function () {
      const stateA: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: true
      }
      const stateB: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const isEnablePerApRadioCustomizationFlag = true
      const type = Type.Upper5GHz

      const actualA = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateA, type, isEnablePerApRadioCustomizationFlag)
      const actualB = StateOfIsUseVenueSettingsHandler.isCurrentTabUseVenueSettings(stateB, type, isEnablePerApRadioCustomizationFlag)

      expect(actualA).toBe(stateA.isUseVenueSettingsUpper5G)
      expect(actualB).toBe(stateB.isUseVenueSettingsUpper5G)
    })
  })
})

describe('HandlerOfOldVersion', () => {
  const handler = new HandlerOfOldVersion()
  describe('test toggleState func', () => {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: undefined,
        isUseVenueSettings5G: undefined,
        isUseVenueSettings6G: undefined,
        isUseVenueSettingsLower5G: undefined,
        isUseVenueSettingsUpper5G: undefined,
        isUseVenueSettings: false
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: undefined,
        isUseVenueSettings5G: undefined,
        isUseVenueSettings6G: undefined,
        isUseVenueSettingsLower5G: undefined,
        isUseVenueSettingsUpper5G: undefined,
        isUseVenueSettings: true
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettings', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: undefined,
        isUseVenueSettings5G: undefined,
        isUseVenueSettings6G: undefined,
        isUseVenueSettingsLower5G: undefined,
        isUseVenueSettingsUpper5G: undefined,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(state.isUseVenueSettings)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const applySettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: false },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
        }
      }

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      expect(actualA).toEqual(applySettings)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
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

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
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

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
  })
})

describe('HandlerOfNewVersion24G', () => {
  const handler = new HandlerOfNewVersion24G()
  describe('test toggleState func', () => {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettings24G', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(true)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const applySettings: ApRadioCustomization = {
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

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: true,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
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

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
        enable24G: false,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      expect(actual).toEqual(expected)
    })
    it('should return use currentData with state when cachedSettings is undefined', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings = undefined

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)
      const expected: ApRadioCustomization = {
        enable24G: true,
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
      expect(actual).toEqual(expected)
    })
  })
})

describe('HandlerOfNewVersion5G', () => {
  const handler = new HandlerOfNewVersion5G()
  describe('test toggleState func', function () {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettings5G', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(true)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
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
      const applySettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: true,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      const expected: ApRadioCustomization = {
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
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
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

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      expect(actual).toEqual(expected)
    })
    it('should return use currentData with state when cachedSettings is undefined', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData = {
        enable24G: false,
        enable50G: true,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
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
      const cachedSettings = undefined

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)
      const expected: ApRadioCustomization = {
        enable24G: false,
        enable50G: true,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      expect(actual).toEqual(expected)
    })
  })
})

describe('HandlerOfNewVersion6G', () => {
  const handler = new HandlerOfNewVersion6G()
  describe('test toggleState func', function () {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettings6G', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(true)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
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
      const applySettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      const expected: ApRadioCustomization = {
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
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
        enable24G: true,
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
      expect(actual).toEqual(expected)
    })
    it('should return use currentData with state when cachedSettings is undefined', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const cachedSettings = undefined

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)
      const expected: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      expect(actual).toEqual(expected)
    })
  })
})

describe('HandlerOfNewVersionLower5G', () => {
  const handler = new HandlerOfNewVersionLower5G()
  describe('test toggleState func', function () {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettingsLower5G', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(true)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
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
      const applySettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: true, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: undefined
        }
      }

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      const expected: ApRadioCustomization = {
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
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      expect(actual).toEqual(expected)
    })
    it('should return use currentData with state when cachedSettings is undefined', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const cachedSettings = undefined

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)
      const expected: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: false },
          radioParamsUpper5G: undefined
        }
      }
      expect(actual).toEqual(expected)
    })
  })
})

describe('HandlerOfNewVersionUpper5G', () => {
  const handler = new HandlerOfNewVersionUpper5G()
  describe('test toggleState func', function () {
    it('should toggle StateOfIsUseVenueSetting correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: true
      }

      const actual = handler.toggleState(state)

      const expected: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      expect(actual).toEqual(expected)
    })
  })
  describe('test isUseVenueSettings func', function () {
    it('should return value of isUseVenueSettingsUpper5G', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }

      const actual = handler.isUseVenueSettings(state)

      expect(actual).toEqual(true)
    })
  })
  describe('test getAppliedSettings func', function () {
    it('should apply Settings correctly', function () {
      const currentSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const applySettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }

      const actualA = handler.getAppliedSettings(currentSettings, applySettings)
      const actualB = handler.getAppliedSettings(undefined, applySettings)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      expect(actualA).toEqual(expected)
      expect(actualB).toEqual(applySettings)
    })
  })
  describe('test getUpdatedApRadioSettings func', () => {
    it('should return use venueSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: true,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
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
      const venueSettings: ApRadioCustomization = {
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
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
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
      expect(actual).toEqual(expected)
    })
    it('should return use cachedSettings correctly', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: true,
        isUseVenueSettings5G: true,
        isUseVenueSettings6G: true,
        isUseVenueSettingsLower5G: true,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: undefined
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: undefined
        }
      }
      const cachedSettings: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: false,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
        }
      }

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)

      const expected: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: true },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: true },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
          radioParamsLower5G: undefined,
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
        }
      }
      expect(actual).toEqual(expected)
    })
    it('should return use currentData with state when cachedSettings is undefined', function () {
      const state: StateOfIsUseVenueSettings = {
        isUseVenueSettings24G: false,
        isUseVenueSettings5G: false,
        isUseVenueSettings6G: false,
        isUseVenueSettingsLower5G: false,
        isUseVenueSettingsUpper5G: false,
        isUseVenueSettings: false
      }
      const currentData = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const venueSettings: ApRadioCustomization = {
        enable24G: true,
        enable50G: true,
        enable6G: true,
        useVenueSettings: true,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: true },
        apRadioParams50G: undefined,
        apRadioParams6G: undefined,
        apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: true },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: true }
        }
      }
      const cachedSettings = undefined

      const actual = handler.getUpdatedApRadioSettings(state, currentData, venueSettings, cachedSettings, handler)
      const expected: ApRadioCustomization = {
        enable24G: false,
        enable50G: false,
        enable6G: true,
        useVenueSettings: false,
        apRadioParams24G: { ...new ApRadioParams24G(), useVenueSettings: false },
        apRadioParams50G: { ...new ApRadioParams50G(), useVenueSettings: false },
        apRadioParams6G: { ...new ApRadioParams6G(), useVenueSettings: false },
        apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
          radioParamsLower5G: { ...new ApRadioParams50G(), useVenueSettings: false },
          radioParamsUpper5G: { ...new ApRadioParams50G(), useVenueSettings: false }
        }
      }
      expect(actual).toEqual(expected)
    })
  })
})
