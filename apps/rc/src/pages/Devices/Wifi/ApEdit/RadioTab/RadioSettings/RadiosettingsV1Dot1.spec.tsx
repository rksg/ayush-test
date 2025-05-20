/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  isCurrentTabUseVenueSettings,
  toggleState,
  getRadioTypeDisplayName,
  RadioType,
  StateOfIsUseVenueSettings
} from '@acx-ui/rc/components'
import { apApi, venueApi } from '@acx-ui/rc/services'
import {
  AFCPowerMode,
  AFCStatus,
  ApRadioCustomizationV1Dot1,
  ApRadioParams24GV1Dot1,
  ApRadioParams50GV1Dot1,
  ApRadioParams6GV1Dot1,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  FirmwareUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { cleanup, mockServer, render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom'


import { ApDataContext, ApEditContext } from '../..'
import {
  apDeviceRadio,
  apDeviceRadioV1Dot1,
  apR760DeviceRadio,
  apT670DeviceRadio,
  apViewModel,
  r560Ap,
  r760ApV1Dot1,
  t670ApV1Dot1,
  triBandApCap,
  tripleBandMode,
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
  isUseVenueSettings,
  RadioSettingsV1Dot1
} from './RadioSettingsV1Dot1'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760')
const r560Cap = triBandApCap.apModels.find(cap => cap.model === 'R560')
const t670Cap = triBandApCap.apModels.find(cap => cap.model === 'T670')

const defaultApEditCxtData = {
  editContextData: {
    tabTitle: '',
    isDirty: false,
    updateChanges: jest.fn(),
    discardChanges: jest.fn()
  },
  setEditContextData: jest.fn()
}

const mockedApModelFamilies = [
  {
    name: 'WIFI_6E',
    displayName: 'Wi-Fi 6e',
    apModels: ['R560',' R760']
  },
  {
    name: 'WIFI_7',
    displayName: 'Wi-Fi 7',
    apModels: ['R770', 'R670', 'T670', 'T670SN', 'H670']
  }
]

const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  floorPlans: [],
  id: '908c47ee1cd445838c3bf71d4addccdf',
  name: 'Test-Venue'
}

describe('RadioSettingsTab', ()=> {
  describe('RadioSettingsTab with R560 AP', () => {
    const defaultR560ApDataCxtData = {
      apData: r560Ap,
      apCapabilities: r560Cap,
      venueData: venueRadioDetail
    }

    beforeEach(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuelist))),
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
        rest.post(
          FirmwareUrlsInfo.getApModelFamilies.url,
          (_, res, ctx) => res(ctx.json(mockedApModelFamilies))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueData))),
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
          (_, res, ctx) => res(ctx.json({}))),
        // v1.1
        rest.post(
          WifiUrlsInfo.getApGroupsList.url,
          (_, res, ctx) => res(ctx.json({
            totalCount: 1, page: 1, data: [
              {
                id: '1724eda6f49e4223be36f864f46faba5',
                venueId: 'venue-id',
                name: ''
              }
            ]
          }))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApOperational.url.replace('?operational=true', ''),
          (_, res, ctx) => res(ctx.json({
            loginPassword: 'admin!234'
          }))
        ),
        rest.post(
          CommonRbacUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json(apViewModel))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json(apDeviceRadio))),
        rest.put(
          WifiRbacUrlsInfo.updateApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(
          WifiRbacUrlsInfo.getApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json(tripleBandMode))),
        rest.get(
          WifiRbacUrlsInfo.getVenueApModelBandModeSettings.url,
          (_, res, ctx) => res(ctx.json([{
            model: 'R760',
            bandMode: 'TRIPLE'
          }]))),
        rest.put(
          WifiRbacUrlsInfo.updateApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    xit('should render correctly', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
          <ApEditContext.Provider value={defaultApEditCxtData}>
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
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
            ...defaultApEditCxtData,
            apViewContextData: {
              apStatusData: {
                afcInfo: {
                  afcStatus: AFCStatus.PASSED,
                  powerMode: AFCPowerMode.STANDARD_POWER
                }
              }
            }
          }}
          >
            <ApDataContext.Provider value={defaultR560ApDataCxtData}>
              <RadioSettingsV1Dot1 />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })

  })

  describe('RadioSettingsTab with R760 AP', () => {
    const defaultR760ApDataCxtData = {
      apData: r760ApV1Dot1,
      apCapabilities: r760Cap,
      venueData: venueRadioDetail
    }

    beforeEach(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuelist))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueRadioDetail))),
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
        rest.post(
          FirmwareUrlsInfo.getApModelFamilies.url,
          (_, res, ctx) => res(ctx.json(mockedApModelFamilies))),
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
          (_, res, ctx) => res(ctx.json({}))),
        // v1.1
        rest.post(
          WifiUrlsInfo.getApGroupsList.url,
          (_, res, ctx) => res(ctx.json({
            totalCount: 1, page: 1, data: [
              {
                id: '59181904e1224ff884b77a4c363d7cbf',
                venueId: '16b11938ee934928a796534e2ee47661',
                name: ''
              }
            ]
          }))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApOperational.url.replace('?operational=true', ''),
          (_, res, ctx) => res(ctx.json({
            loginPassword: 'admin!234'
          }))
        ),
        rest.post(
          CommonRbacUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json(apViewModel))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json(apDeviceRadioV1Dot1))),
        rest.put(
          WifiRbacUrlsInfo.updateApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(
          WifiRbacUrlsInfo.getApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json(tripleBandMode))),
        rest.get(
          WifiRbacUrlsInfo.getVenueApModelBandModeSettings.url,
          (_, res, ctx) => res(ctx.json([{
            model: 'R760',
            bandMode: 'TRIPLE'
          }]))),
        rest.put(
          WifiRbacUrlsInfo.updateApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    it('should render 6G channels correctly for R760 when separation', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            ...defaultApEditCxtData,
            apViewContextData: {
              apStatusData: {
                afcInfo: {
                  afcStatus: AFCStatus.PASSED,
                  powerMode: AFCPowerMode.STANDARD_POWER
                }
              }
            }
          }}
          >
            <ApDataContext.Provider value={defaultR760ApDataCxtData}>
              <RadioSettingsV1Dot1 />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await screen.findByRole('tab', { name: '6 GHz' })
    })
  })

  describe('RadioSettingsTab with T670 AP', () => {
    const defaultT670ApDataCxtData = {
      apData: t670ApV1Dot1,
      apCapabilities: t670Cap,
      venueData: venueRadioDetail
    }

    beforeEach(() => {
      store.dispatch(apApi.util.resetApiState())
      store.dispatch(venueApi.util.resetApiState())
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockServer.use(
        rest.get(
          CommonUrlsInfo.getVenuesList.url,
          (_, res, ctx) => res(ctx.json(venuelist))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueRadioDetail))),
        rest.get(
          WifiUrlsInfo.getApRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(apT670DeviceRadio))),
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
          (_, res, ctx) => res(ctx.json(apT670DeviceRadio))),
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
          (_, res, ctx) => res(ctx.json({}))),
        rest.put(
          CommonRbacUrlsInfo.getVenueApModelBandModeSettings.url,
          (_, res, ctx) => res(ctx.json(tripleBandMode))),
        // v1.1
        rest.post(
          WifiUrlsInfo.getApGroupsList.url,
          (_, res, ctx) => res(ctx.json({
            totalCount: 1, page: 1, data: [
              {
                id: '1724eda6f49e4223be36f864f46faba5',
                venueId: 'venue-id',
                name: ''
              }
            ]
          }))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApOperational.url.replace('?operational=true', ''),
          (_, res, ctx) => res(ctx.json({
            loginPassword: 'admin!234'
          }))
        ),
        rest.post(
          CommonRbacUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json(apViewModel))
        ),
        rest.get(
          WifiRbacUrlsInfo.getApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json(apDeviceRadio))),
        rest.put(
          WifiRbacUrlsInfo.updateApRadioCustomizationV1Dot1.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(
          WifiRbacUrlsInfo.getApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json(tripleBandMode))),
        rest.get(
          WifiRbacUrlsInfo.getVenueApModelBandModeSettings.url,
          (_, res, ctx) => res(ctx.json([{
            model: 'T670',
            bandMode: 'TRIPLE'
          }]))),
        rest.put(
          WifiRbacUrlsInfo.updateApBandModeSettingsV1Dot1.url,
          (_, res, ctx) => res(ctx.json({})))
      )
    })

    afterEach(() => cleanup())

    it('should render 6G channels correctly for T670 when separation', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            ...defaultApEditCxtData,
            apViewContextData: {
              apStatusData: {
                afcInfo: {
                  afcStatus: AFCStatus.PASSED,
                  powerMode: AFCPowerMode.STANDARD_POWER
                }
              }
            }
          }}
          >
            <ApDataContext.Provider value={defaultT670ApDataCxtData}>
              <RadioSettingsV1Dot1 />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, { route: { params } })

      await screen.findByRole('tab', { name: '6 GHz' })

      const r6gTab = await screen.findByRole('tab', { name: '6 GHz' })
      await userEvent.click(r6gTab)
      const outdoorChannel = await screen.findByText('93')
      expect(outdoorChannel).toBeInTheDocument()
      expect(screen.queryAllByText('97').length).toBe(0)
      expect(screen.queryAllByText('101').length).toBe(0)
      expect(screen.queryAllByText('105').length).toBe(0)
      expect(screen.queryAllByText('109').length).toBe(0)
      expect(screen.queryAllByText('113').length).toBe(0)
      expect(screen.queryAllByText('185').length).toBe(0)
      expect(screen.queryAllByText('189').length).toBe(0)
      expect(screen.queryAllByText('193').length).toBe(0)
      expect(screen.queryAllByText('197').length).toBe(0)
      expect(screen.queryAllByText('221').length).toBe(0)
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
  it('should return value of isUseVenueSettings24G', function () {
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
  it('should return value of isUseVenueSettings5G', function () {
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
  it('should return value of isUseVenueSettings6G', function () {
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
  it('should return value of isUseVenueSettingsLower5G', function () {
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
  it('should return value of isUseVenueSettingsUpper5G', function () {
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
  it('should return correctly', function () {
    const settings: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }

    const actualA = isUseVenueSettings(settings, RadioType.Normal24GHz)
    const actualB = isUseVenueSettings(settings, RadioType.Normal5GHz)
    const actualC = isUseVenueSettings(settings, RadioType.Normal6GHz)
    const actualD = isUseVenueSettings(settings, RadioType.Lower5GHz)
    const actualE = isUseVenueSettings(settings, RadioType.Upper5GHz)

    expect(actualA).toEqual(settings.apRadioParams24G.useVenueOrApGroupSettings)
    expect(actualB).toEqual(settings.apRadioParams50G?.useVenueOrApGroupSettings)
    expect(actualC).toEqual(settings.apRadioParams6G?.useVenueOrApGroupSettings)
    expect(actualD).toEqual(settings.apRadioParamsDual5G?.radioParamsLower5G?.useVenueOrApGroupSettings)
    expect(actualE).toEqual(settings.apRadioParamsDual5G?.radioParamsUpper5G?.useVenueOrApGroupSettings)
  })
})

describe('test extractStateOfIsUseVenueSettings func', () => {
  it('should return correctly', function () {
    const apRadioCustomizationA: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const apRadioCustomizationB: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const apRadioCustomizationC: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const apRadioCustomizationD: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const apRadioCustomizationE: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const apRadioCustomizationF: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false }
      }
    }
    const apRadioCustomizationG: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
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
  it('should toggle StateOfIsUseVenueSetting correctly', function () {
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

    const actualA = toggleState(stateA, RadioType.Normal24GHz)
    const actualB = toggleState(stateB, RadioType.Normal5GHz)
    const actualC = toggleState(stateC, RadioType.Normal6GHz)
    const actualD = toggleState(stateD, RadioType.Lower5GHz)
    const actualE = toggleState(stateE, RadioType.Upper5GHz)


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
  it('should return correctly', function () {
    const currentSettings: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const cacheSettings: ApRadioCustomizationV1Dot1 = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal24GHz)
    const actualB = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal5GHz)
    const actualC = createCacheSettings(currentSettings, cacheSettings, RadioType.Normal6GHz)
    const actualD = createCacheSettings(currentSettings, cacheSettings, RadioType.Lower5GHz)
    const actualE = createCacheSettings(currentSettings, cacheSettings, RadioType.Upper5GHz)

    const expectedA = {
      enable24G: true,
      enable50G: false,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
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
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
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
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const expectedD = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: true, upper5gEnabled: false,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: undefined
      }
    }

    const expectedE = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
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
  it('should return correctly', function () {
    const currentSettings: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    const updateSettings: ApRadioCustomizationV1Dot1 = {
      enable24G: false,
      enable50G: false,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: false, lower5gEnabled: false, upper5gEnabled: false,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: undefined
      }
    }

    const actualA = applySettings(currentSettings, updateSettings, RadioType.Normal24GHz)
    const actualB = applySettings(currentSettings, updateSettings, RadioType.Normal5GHz)
    const actualC = applySettings(currentSettings, updateSettings, RadioType.Normal6GHz)
    const actualD = applySettings(currentSettings, updateSettings, RadioType.Lower5GHz)
    const actualE = applySettings(currentSettings, updateSettings, RadioType.Upper5GHz)

    const expectedA = {
      enable24G: false,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }

    const expectedB = {
      enable24G: true,
      enable50G: false,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }

    const expectedC = {
      enable24G: true,
      enable50G: true,
      enable6G: false,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: undefined,
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }

    const expectedD = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: false, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }

    const expectedE = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: false,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
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
    const settings: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false }
      }
    }

    const actual = applyState(state, settings)
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true },
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
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
    const settings: ApRadioCustomizationV1Dot1 = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: false },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: false }
      }
    }

    const actual = applyState(state, settings)
    const expected = {
      enable24G: true,
      enable50G: true,
      enable6G: true,
      apRadioParams24G: { ...new ApRadioParams24GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParams50G: undefined,
      apRadioParams6G: { ...new ApRadioParams6GV1Dot1(), useVenueOrApGroupSettings: true },
      apRadioParamsDual5G: { enabled: true, lower5gEnabled: true, upper5gEnabled: true,
        radioParamsLower5G: undefined,
        radioParamsUpper5G: { ...new ApRadioParams50GV1Dot1(), useVenueOrApGroupSettings: true }
      }
    }
    expect(actual).toEqual(expected)
  })
})
