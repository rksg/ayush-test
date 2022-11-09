import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor
} from '@acx-ui/test-utils'

import {
  venuelist,
  venueCaps,
  aplist,
  apGrouplist,
  apDetailsList,
  dhcpAp,
  successResponse
} from '../../__tests__/fixtures'

import { ApEdit } from './'

async function showInvalidChangesModal (tabKey, discard) {
  const dialog = await screen.findByRole('dialog')
  await screen.findByText('You Have Invalid Changes')
  await screen.findByText(`Do you want to discard your changes in "${tabKey}"?`)
  fireEvent.click(
    within(dialog).getAllByRole('button', { name: discard ? 'Discard Changes' : 'Cancel' })[0]
  )
}

async function showUnsavedChangesModal (tabKey, discard) {
  await screen.findByRole('dialog')
  await screen.findByText('You Have Unsaved Changes')
  await screen.findByText
  (`Do you want to save your changes in "${tabKey}", or discard all changes?`)
  fireEvent.click(
    await screen.findByRole('button', { name: discard ? 'Discard Changes' : 'Save Changes' })
  )
}

describe('ApEdit', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    initialize()
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(WifiUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.post(CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(aplist))),
      rest.get(CommonUrlsInfo.getApGroupList.url,
        (_, res, ctx) => res(ctx.json(apGrouplist))),
      rest.post(WifiUrlsInfo.addAp.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.getAp.url,
        (_, res, ctx) => res(ctx.json(apDetailsList[0]))),
      rest.post(WifiUrlsInfo.getDhcpAp.url,
        (_, res, ctx) => res(ctx.json(dhcpAp[0]))),
      rest.put(WifiUrlsInfo.updateAp.url,
        (_, res, ctx) => res(ctx.json(successResponse)))
    )
  })
  afterEach(() => Modal.destroyAll())

  describe('Ap Details', () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      serialNumber: 'serial-number',
      action: 'edit',
      activeTab: 'details'
    }
    jest.mock('react', () => ({
      ...jest.requireActual('react'),
      useRef: jest.fn(() => ({
        current: jest.fn(() => null)
      }))
    }))

    it('should handle invalid changes', async () => {
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
        path: '/:tenantId/devices/aps/:serialNumber/edit/:activeTab'
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

    it('should disable venue select when editing mesh AP', async () => {
      mockServer.use(
        rest.post(WifiUrlsInfo.getDhcpAp.url,
          (_, res, ctx) => res(ctx.json(dhcpAp[1]))),
        rest.get(WifiUrlsInfo.getAp.url,
          (_, res, ctx) => res(ctx.json({
            ...apDetailsList[0],
            meshRole: 'RAP'
          })))
      )

      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/aps/:serialNumber/edit/:activeTab'
      })
      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(screen.getByLabelText(/Venue/)).toBeDisabled()
    })

    it('should handle error occurred', async () => {
      mockServer.use(
        rest.put(WifiUrlsInfo.updateAp.url,
          (_, res, ctx) => {
            return res(ctx.status(400), ctx.json({ errors: [{ code: 'WIFI-10000' }] }))
          })
      )
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/aps/:serialNumber/edit/:activeTab'
      })
      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      expect(screen.getByLabelText(/Venue/)).toBeDisabled()
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      await screen.findByText('An error occurred')
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })

    it('should open unsaved changes modal', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/aps/:serialNumber/edit/:activeTab'
      })

      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      fireEvent.change(screen.getByLabelText(/AP Name/), { target: { value: 'test ap 2' } })
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'description' } })
      await userEvent.click(await screen.findByText('Back to device details'))
      await showUnsavedChangesModal('AP Details', false)
    })

    it('should open invalid changes modal', async () => {
      render(<Provider><ApEdit /></Provider>, {
        route: { params },
        path: '/:tenantId/devices/aps/:serialNumber/edit/:activeTab'
      })

      await screen.findByText('test ap')
      await waitFor(async () => {
        expect(screen.getByLabelText(/AP Name/)).toHaveValue('test ap')
      })

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => {
        fireEvent.change(screen.getByLabelText(/AP Name/), { target: { value: 'aaaa' } })
        fireEvent.blur(screen.getByLabelText(/AP Name/))
      })

      await userEvent.click(await screen.findByText('Back to device details'))
      await showInvalidChangesModal('AP Details', false)
      await userEvent.click(await screen.findByRole('tab', { name: 'Settings' }))
      await showInvalidChangesModal('AP Details', true)
    })
  })
})
