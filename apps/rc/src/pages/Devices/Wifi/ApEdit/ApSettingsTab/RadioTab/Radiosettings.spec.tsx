import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { apApi, venueApi }                             from '@acx-ui/rc/services'
import { CommonUrlsInfo, getUrlForTest, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { cleanup, mockServer, render, screen }         from '@acx-ui/test-utils'

import { ApDataContext }    from '..'
import { ApEditContext }    from '../..'
import {
  apDeviceRadio,
  apR760DeviceRadio,
  r560Ap,
  r760Ap,
  triBandApCap,
  venuelist,
  venueRadioDetail,
  validRadioChannels,
  venueRadioCustomization
} from '../../../../__tests__/fixtures'

import { RadioSettings } from './RadioSettings'


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
        //rest.get(
        //  WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        //  (_, res, ctx) => res(ctx.json(r560Ap))),
        //rest.get(
        //  WifiUrlsInfo.getApCapabilities.url,
        //  (_, res, ctx) => res(ctx.json(triBandApCap))),
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))

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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))

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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
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

    it('should render correctly with Customize or Use Venue Settings', async () => {
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

  describe.skip('RadioSettingsTab with R760 AP', () => {
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

    it.skip('should render correctly', async () => {
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

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
    })

    it.skip('should render correctly when tri-band type is dual5G mode', async () => {
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

    it.skip('should render correctly with disable lower 5G', async () => {
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

    it.skip('should render correctly with disable upper 5G', async () => {
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
