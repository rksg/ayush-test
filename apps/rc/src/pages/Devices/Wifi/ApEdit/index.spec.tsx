import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                                        from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, CommonUrlsInfo, FirmwareUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  apGrouplist,
  apDetailsList,
  apLanPorts,
  dhcpAp,
  successResponse,
  venueData,
  venueLanPorts,
  venueSetting,
  venueVersionList,
  deviceAps
} from '../../__tests__/fixtures'

import { ApEdit } from './'

const buttonAction = {
  DISCARD_CHANGES: 'Discard Changes',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel'
}

async function showInvalidChangesModal (tabKey: string, action: string) {
  dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Invalid Changes')
  await screen.findByText(`Do you want to discard your changes in "${tabKey}"?`)
  fireEvent.click(
    within(dialog).getAllByRole('button', { name: action })[0]
  )

  await waitFor(async () => {
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)
  })
  expect(dialog).not.toBeVisible()
  dialog = null
}

async function showUnsavedChangesModal (tabKey: string, action: string) {
  dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Unsaved Changes')
  await screen.findByText
  (`Do you want to save your changes in "${tabKey}", or discard all changes?`)
  fireEvent.click(
    within(dialog).getAllByRole('button', { name: action })[0]
  )

  await waitFor(async () => {
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)
  })
  expect(dialog).not.toBeVisible()
  dialog = null
}

let dialog = null

describe('ApEdit', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(WifiUrlsInfo.addAp.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.split(':serialNumber')[0],
        (_, res, ctx) => res(ctx.json(apDetailsList))),
      rest.post(WifiUrlsInfo.getDhcpAp.url,
        (_, res, ctx) => res(ctx.json(dhcpAp[0]))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(deviceAps))),
      rest.put(WifiUrlsInfo.updateAp.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          global: { mapRegion: 'US',defaultLanguage: 'en-US' },
          edgeBeta: { 'enabled': 'true','Start Date': '2023-06-08 UTC' }
        }))
      ),
      rest.get(FirmwareUrlsInfo.getVenueVersionList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(venueVersionList))
      )
    )
  })

  describe('Ap Edit - General', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      serialNumber: 'serial-number',
      action: 'edit',
      activeTab: 'general'
    }

    it('should render correctly', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
        }
      })

      await screen.findByRole('heading', { name: 'test ap', level: 1 })
      await waitFor(async () => {
        expect(await screen.findByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(await screen.findAllByRole('tab')).toHaveLength(5)
      await screen.findByText(/37.411275, -122.019191 \(As venue\)/)
    })

    it('Should render correctly when ap has not connected to the cloud', async () => {
      mockServer.use(
        rest.post(CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            ...deviceAps,
            data: [{
              ...(_.omit(deviceAps?.data?.[0], ['model']))
            }]
          })))
      )
      render(<Provider><ApEdit /></Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
        }
      })

      await screen.findByRole('heading', { name: 'test ap', level: 1 })
      await waitFor(async () => {
        expect(await screen.findByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(await screen.findAllByRole('tab')).toHaveLength(1)
    })

    it('should open unsaved changes modal', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
        }
      })

      jest.restoreAllMocks()
      await screen.findByRole('heading', { name: 'test ap', level: 1 })
      await waitFor(async () => {
        expect(await screen.findByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      fireEvent.change(await screen.findByLabelText(/AP Name/), { target: { value: 'test ap 2' } })
      fireEvent.change(
        await screen.findByLabelText('Description'), { target: { value: 'description' } }
      )
      await userEvent.click(await screen.findByText('Back to device details'))
      await showUnsavedChangesModal('General', buttonAction.CANCEL)
    })

    it('should open invalid changes modal', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/wifi/:serialNumber/:action/:activeTab'
        }
      })

      await screen.findByRole('heading', { name: 'test ap', level: 1 })
      await waitFor(async () => {
        expect(await screen.findByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      fireEvent.change(await screen.findByLabelText(/AP Name/), { target: { value: 'aaaa' } })
      expect(await screen.findByText(/This field is invalid/)).toBeVisible()
      expect(await screen.findAllByRole('img', { name: 'check-circle' })).toHaveLength(1)

      await userEvent.click(await screen.findByText('Back to device details'))
      await showInvalidChangesModal('General', buttonAction.CANCEL)
      // await userEvent.click(await screen.findByText('Back to device details'))
      // await showInvalidChangesModal('General', buttonAction.DISCARD_CHANGES)
    })

    // TODO: should test in apForm
    it.skip('should handle data updated', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab'
      })

      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      fireEvent.change(screen.getByLabelText(/AP Name/), { target: { value: 'test ap2' } })
      fireEvent.blur(screen.getByLabelText(/AP Name/))

      await fireEvent.click(await screen.findByRole('button', { name: 'Change' }))
      const dialog = await screen.findByRole('dialog')
      await within(dialog).findByText('GPS Coordinates')
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => {
        fireEvent.change(within(dialog).getByTestId('coordinates-input'),
          { target: { value: '51.508506, -0.124915' } })
      })
      await fireEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
      expect(await screen.findByText('Please confirm that...')).toBeVisible()
      await fireEvent.click(await screen.findByRole('button', { name: 'Drop It' }))

      await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
      await fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    it.skip('should handle invalid changes', async () => {
      mockServer.use(
        rest.get(WifiUrlsInfo.getWifiCapabilities.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.post(WifiUrlsInfo.getDhcpAp.url,
          (_, res, ctx) => res(ctx.json({}))),
        rest.get(CommonUrlsInfo.getApGroupList.url,
          (_, res, ctx) => res(ctx.json({})))
      )
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab'
      })

      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(screen.getByLabelText(/Venue/)).not.toBeDisabled() // not Mesh & Dhcp AP
      fireEvent.mouseDown(screen.getByLabelText(/Venue/))
      await userEvent.click(await screen.getAllByText('Venue-DHCP')[0])

      fireEvent.change(screen.getByLabelText(/AP Name/), { target: { value: 'aaaa' } })
      fireEvent.blur(screen.getByLabelText(/AP Name/))

      await userEvent.click(await screen.findByText('Back to device details'))
      await screen.findByText('This field is invalid')
      await screen.findByText('Cannot move AP to another venue in different country')
    })

    it.skip('should disable venue select when editing mesh AP', async () => {
      mockServer.use(
        rest.post(WifiUrlsInfo.getDhcpAp.url,
          (_, res, ctx) => res(ctx.json(dhcpAp[1]))),
        rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
          (_, res, ctx) => res(ctx.json({
            ...apDetailsList[0],
            meshRole: 'RAP'
          })))
      )

      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab'
      })
      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(screen.getByLabelText(/Venue/)).toBeDisabled()
    })

    it.skip('should handle error occurred', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      mockServer.use(
        rest.put(WifiUrlsInfo.updateAp.url,
          (_, res, ctx) => {
            return res(ctx.status(400), ctx.json({ errors: [{ code: 'WIFI-xxxxx' }] }))
          })
      )
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab'
      })
      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(screen.getByLabelText(/Venue/)).toBeDisabled()
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      await screen.findByText('Error occurred while updating AP')
    })
  })

  xdescribe('Ap Edit - Lan Ports', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      serialNumber: 'serial-number',
      action: 'edit',
      activeTab: 'settings',
      activeSubTab: 'lanPort'
    }
    beforeEach(() => {
      mockServer.use(
        rest.get(WifiUrlsInfo.getAp.url,
          (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
        rest.get(WifiUrlsInfo.getApLanPorts.url,
          (_, res, ctx) => res(ctx.json(apLanPorts[0]))),
        rest.get(WifiUrlsInfo.getApCapabilities.url,
          (_, res, ctx) => res(ctx.json(venueCaps))),
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(venueData))),
        rest.get(CommonUrlsInfo.getVenueSettings.url,
          (_, res, ctx) => res(ctx.json(venueSetting))),
        rest.get(CommonUrlsInfo.getVenueLanPorts.url,
          (_, res, ctx) => res(ctx.json(venueLanPorts))),
        rest.post(CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json(deviceAps)))
      )
    })
    afterEach(() => Modal.destroyAll())

    it('should render correctly', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      await screen.findByText('test ap')
      await screen.findByText(/Currently using LAN port settings of the venue/)
      await fireEvent.click(await screen.findByRole('button', { name: 'My-Venue' }))
    })

    it('should render breadcrumb correctly', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Wi-Fi')).toBeVisible()
      expect(await screen.findByText('Access Points')).toBeVisible()
      expect(screen.getByRole('link', {
        name: /ap list/i
      })).toBeTruthy()
    })

    it('should handle customized setting updated', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await screen.findByText('test ap')
      await screen.findByText(/Currently using LAN port settings of the venue/)
      await screen.findByText(/Customize/)

      await userEvent.click(await screen.findByRole('tab', { name: 'LAN 2' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    })

    it('should handle customized setting removed', async () => {
      mockServer.use(
        rest.get(WifiUrlsInfo.getApLanPorts.url,
          (_, res, ctx) => res(ctx.json({
            ...apLanPorts[0],
            useVenueSettings: false
          })))
      )

      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await screen.findByText('test ap')
      await screen.findByText(/Custom settings/)
      await screen.findByText(/Use Venue Settings/)

      await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    })

    it('should open unsaved changes modal', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await screen.findByText('test ap')
      await screen.findByText(/Currently using LAN port settings of the venue/)
      await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))
      await userEvent.click(await screen.findByText('Back to device details'))
      await showUnsavedChangesModal('LAN Port', false)
    })

    it('should open invalid changes modal', async () => {
      mockServer.use(
        rest.get(WifiUrlsInfo.getApLanPorts.url,
          (_, res, ctx) => res(ctx.json({
            ...apLanPorts[0],
            useVenueSettings: false
          })))
      )

      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/wifi/:serialNumber/edit/:activeTab/:activeSubTab'
      })
      await screen.findByText('test ap')
      await screen.findByText(/Custom settings/)
      await screen.findByText(/Use Venue Settings/)

      const tabPanel = screen.getAllByRole('tabpanel', { hidden: false })[2]
      fireEvent.mouseDown(within(tabPanel).getByLabelText(/Port type/))
      await fireEvent.click(await screen.getAllByText('GENERAL')[1])
      expect(within(tabPanel).getByLabelText(/VLAN untag ID/)).not.toBeDisabled()
      expect(within(tabPanel).getByLabelText(/VLAN member/)).not.toBeDisabled()

      fireEvent.change(within(tabPanel).getByLabelText(/VLAN untag ID/), { target: { value: '' } })
      fireEvent.change(within(tabPanel).getByLabelText(/VLAN member/), { target: { value: '' } })
      fireEvent.blur(within(tabPanel).getByLabelText(/VLAN member/))
      await userEvent.click(await screen.findByText('Back to device details'))
      await showInvalidChangesModal('LAN Port', true)
    })
  })
})
