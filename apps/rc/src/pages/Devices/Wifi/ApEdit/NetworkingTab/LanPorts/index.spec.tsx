import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { apApi, venueApi }        from '@acx-ui/rc/services'
import {
  AaaUrls,
  CommonUrlsInfo,
  EthernetPortProfileUrls,
  IpsecUrls,
  LanPortsUrls,
  SoftGreUrls,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ApNetworkingContext }          from '..'
import { ApDataContext, ApEditContext } from '../..'
import {
  ApCap_T750SE,
  ApData_T750SE,
  ApLanPorts_has_vni,
  ApLanPorts_T750SE,
  mockDefaultTunkEthertnetPortProfile,
  mockedAPLanPortSettings1,
  mockedAPLanPortSettings2,
  mockedAPLanPortSettings3,
  mockedVenueLanPortSettings1,
  mockedVenueLanPortSettings2,
  mockedVenueLanPortSettings3,
  mockEthProfiles,
  venueData,
  venueLanPorts,
  venueSetting
} from '../../../../__tests__/fixtures'

import { LanPorts } from '.'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
describe('Lan Port', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(WifiRbacUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(WifiUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(ApLanPorts_T750SE))),
      rest.get(WifiRbacUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(ApLanPorts_T750SE))),
      rest.put(WifiUrlsInfo.updateApLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(WifiRbacUrlsInfo.updateApLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.delete(WifiUrlsInfo.resetApLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(LanPortsUrls.getVenueLanPortSettings.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        LanPortsUrls.getApLanPortSettings.url,
        (_, res, ctx) => {
          if(_.params.portId === '1') {
            return res(ctx.json(mockedAPLanPortSettings1))
          }

          if(_.params.portId === '2') {
            return res(ctx.json(mockedAPLanPortSettings2))
          }

          if(_.params.portId === '3') {
            return res(ctx.json(mockedAPLanPortSettings3))
          }

          return res(ctx.json({}))
        }
      ),
      rest.get(
        LanPortsUrls.getVenueLanPortSettings.url,
        (_, res, ctx) => {
          if(_.params.portId === '1') {
            return res(ctx.json(mockedVenueLanPortSettings1))
          }

          if(_.params.portId === '2') {
            return res(ctx.json(mockedVenueLanPortSettings2))
          }

          if(_.params.portId === '3') {
            return res(ctx.json(mockedVenueLanPortSettings3))
          }

          return res(ctx.json({}))
        }
      ),
      rest.post(SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  describe('AP Lan port settings', () => {
    const defaultT750SeApCtxData = {
      apData: ApData_T750SE,
      apCapabilities: ApCap_T750SE,
      venueData
    }

    it ('Should render correctly with AP model T750SE', async () => {
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              hasError: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn(),
            editNetworkingContextData: {} as ApNetworkingContext,
            setEditNetworkingContextData: jest.fn()
          }}>
            <ApDataContext.Provider value={defaultT750SeApCtxData}>
              <LanPorts />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>,{
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      const tabs = await screen.findAllByRole('tab')
      // T750SE have 3 Lan ports
      expect(tabs.length).toBe(3)
      await userEvent.click(tabs[1])

      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))

      expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()

      /* Waiting for backend support AP PoE mode settings
      const poeCombobox = await screen.findByRole('combobox', { name: 'PoE Operating Mode' })
      await userEvent.click(poeCombobox)


      // T750SE have 5 PoE modes:[ 'Auto', '802.3at', '802.3bt-Class_5', '802.3bt-Class_6', '802.3bt-Class_7']
      expect(await screen.findByTitle('802.3at')).toBeInTheDocument()
      expect(await screen.findByTitle('802.3bt/Class 5')).toBeInTheDocument()
      expect(await screen.findByTitle('802.3bt/Class 6')).toBeInTheDocument()
      expect(await screen.findByTitle('802.3bt/Class 7')).toBeInTheDocument()
      await userEvent.click(await screen.findByTitle('802.3bt/Class 5'))
      const option802_3bt_5 = await screen.findByRole('option', { name: '802.3bt/Class 5' })
      expect(option802_3bt_5.getAttribute('aria-selected')).toBe('true')
      */
      await userEvent.click(await screen.findByRole('switch', { name: 'Enable port' }))


      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

      const venueLink = await screen.findByRole('button', { name: 'My-Venue' })
      expect(venueLink).toBeInTheDocument()
      await userEvent.click(venueLink)
      expect(mockedUsedNavigate).toBeCalled()
    })

    it ('Should render LAN ports reset to default correctly with AP', async () => {
      // Given
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              hasError: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn(),
            editNetworkingContextData: {} as ApNetworkingContext,
            setEditNetworkingContextData: jest.fn()
          }}>
            <ApDataContext.Provider value={defaultT750SeApCtxData}>
              <LanPorts />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>,{
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      const tabs = await screen.findAllByRole('tab')
      await userEvent.click(tabs[1])

      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))

      const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
      expect(enablePort).toBeEnabled()
      expect(enablePort).toHaveAttribute('aria-checked', 'true')
      await userEvent.click(enablePort)
      expect(await screen.findByRole('switch', { name: 'Enable port' }))
        .toHaveAttribute('aria-checked', 'false')

      // When
      const resetBtn = await screen.findByRole('button', { name: 'Reset to default' })
      expect(resetBtn).toBeInTheDocument()
      await userEvent.click(resetBtn)

      // Then
      expect(await screen.findByRole('switch', { name: 'Enable port' }))
        .toHaveAttribute('aria-checked', 'true')

      // When
      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

      // Then
      expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()

      const venueLink = await screen.findByRole('button', { name: 'My-Venue' })
      expect(venueLink).toBeInTheDocument()
      await userEvent.click(venueLink)
      expect(mockedUsedNavigate).toBeCalled()
    })
  })

  describe('AP Ethernet Port Profile', () => {
    const defaultT750SeApCtxData = {
      apData: ApData_T750SE,
      apCapabilities: ApCap_T750SE,
      venueData
    }

    beforeEach(() => {
      store.dispatch(venueApi.util.resetApiState())
      store.dispatch(apApi.util.resetApiState())

      mockServer.use(
        rest.post(EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockEthProfiles))),
        rest.post(AaaUrls.getAAAPolicyViewModelList.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.post(EthernetPortProfileUrls.createEthernetPortProfile.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(EthernetPortProfileUrls.getEthernetPortProfile.url,
          (_, res, ctx) => res(ctx.json(mockDefaultTunkEthertnetPortProfile))),

        rest.get(WifiUrlsInfo.updateAp.url,
          (_, res, ctx) => res(ctx.json({ model: 'T750SE' }))),
        rest.get(
          LanPortsUrls.getApLanPortSettings.url,
          (_, res, ctx) => {
            if(_.params.portId === '1') {
              return res(ctx.json(mockedAPLanPortSettings1))
            }

            if(_.params.portId === '2') {
              return res(ctx.json(mockedAPLanPortSettings2))
            }

            if(_.params.portId === '3') {
              return res(ctx.json(mockedAPLanPortSettings3))
            }

            return res(ctx.json({}))
          }
        ),
        rest.get(
          LanPortsUrls.getVenueLanPortSettings.url,
          (_, res, ctx) => {
            if(_.params.portId === '1') {
              return res(ctx.json(mockedVenueLanPortSettings1))
            }

            if(_.params.portId === '2') {
              return res(ctx.json(mockedVenueLanPortSettings2))
            }

            if(_.params.portId === '3') {
              return res(ctx.json(mockedVenueLanPortSettings3))
            }

            return res(ctx.json({}))
          }
        )
      )
    })

    it ('Should render ethernet profile correctly with AP model T750SE', async () => {
      // Given
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.ETHERNET_PORT_PROFILE_TOGGLE)
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              hasError: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn(),
            editNetworkingContextData: {} as ApNetworkingContext,
            setEditNetworkingContextData: jest.fn()
          }}>
            <ApDataContext.Provider value={defaultT750SeApCtxData}>
              <LanPorts />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>,{
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      const tabs = await screen.findAllByRole('tab')
      await userEvent.click(tabs[1])

      const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
      expect(enablePort).toHaveAttribute('aria-checked', 'true')

      const profileSelector = await screen.findByRole('combobox', { name: 'Ethernet Port Profile' })
      expect(profileSelector).toBeInTheDocument()
      await userEvent.click(profileSelector)

      const detailBtn = await screen.findByRole('button', { name: 'Profile Details' })
      expect(detailBtn).toBeInTheDocument()
      await userEvent.click(detailBtn)

      expect(await screen.findAllByText('Port Type')).toHaveLength(3)
      expect(await screen.findAllByText('VLAN Untag ID')).toHaveLength(4)
      expect(await screen.findAllByText('VLAN Members')).toHaveLength(3)
      expect(await screen.findAllByText('802.1X')).toHaveLength(4)

      expect(screen.queryByRole('button', { name: 'Add Profile' })).not.toBeInTheDocument()
    })

    it ('Should render ethernet profile correctly with AP model has Vni', async () => {
      mockServer.use(
        rest.get(WifiUrlsInfo.getApLanPorts.url,
          (_, res, ctx) => res(ctx.json(ApLanPorts_has_vni)))
      )

      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.ETHERNET_PORT_PROFILE_TOGGLE)
      render(
        <Provider>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              hasError: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn(),
            editNetworkingContextData: {} as ApNetworkingContext,
            setEditNetworkingContextData: jest.fn()
          }}>
            <ApDataContext.Provider value={defaultT750SeApCtxData}>
              <LanPorts />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>,{
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Use Venue Settings' })).not.toBeInTheDocument()
      expect(await screen.findByRole('switch', { name: 'Enable port' })).toBeDisabled()
      expect(screen.queryByRole('combobox', { name: 'Ethernet Port Profile' }))
        .not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Profile Details' }))
        .not.toBeInTheDocument()

      const tabs = await screen.findAllByRole('tab')
      await userEvent.click(tabs[2])
      expect(await screen.findByRole('switch', { name: 'Enable port' })).toBeDisabled()
      expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Use Venue Settings' })).not.toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'Ethernet Port Profile' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Profile Details' })).toBeInTheDocument()
    })
  })
})

