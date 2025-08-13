import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  EdgeSdLanUrls,
  Network,
  VlanPoolRbacUrls,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, mockServer, within } from '@acx-ui/test-utils'

import {
  venueNetworkTableV2QueryMock,
  venueNetworkTableV2QueryWithApGroupMock,
  venueData
} from './__tests__/fixtures'

import { ApGroupNetworksTable } from './index'

const addNetworkVenueReq = jest.fn()
const updateNetworkVenueReq = jest.fn()

jest.mock('./ApGroupNetworkVlanRadioDrawer', () => ({
  // eslint-disable-next-line max-len
  ApGroupNetworkVlanRadioDrawer: ({ updateData }: { updateData: (data: Network[], oldData: Network[]) => void }) => {
    return (
      <div data-testid='apgroup-network-vlan-radio-drawer'>
        <button
          data-testid='drawer-save-button'
          onClick={() => {
            updateData(
              [{ id: 'test-network' } as unknown as Network],
              [{ id: 'old-test-network' } as unknown as Network]
            )
          }}
        >
          ok
        </button>
      </div>
    )
  }
}))

const services = require('@acx-ui/rc/services')


describe('ApGroupNetworksTable with activated column', () => {
  beforeEach(() => {
    services.useEnhanceVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: venueNetworkTableV2QueryMock }
    })

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (_, res, ctx) => res(ctx.json({ venue: venueData }))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.put(
        WifiRbacUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => {
          addNetworkVenueReq()
          return res(ctx.json({ requestId: 'addNetworkVenueReq' }))
        }
      ),
      rest.put(
        WifiRbacUrlsInfo.updateNetworkVenue.url,
        (req, res, ctx) => {
          updateNetworkVenueReq()
          return res(ctx.json({ requestId: 'updateNetworkVenueReq' }))
        }
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('renders without crashing', async () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    render(
      <Provider>
        <ApGroupNetworksTable venueId='testVenueId' apGroupId='testApGroupId' />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      })

    expect(await screen.findByText('Add Network')).toBeInTheDocument()
    expect(await screen.findByRole('columnheader', { name: /activated/i })).toBeVisible()

    const row = await screen.findByRole('row', { name: /standby/i })

    const toogleButton = await within(row).findByRole('switch', { checked: false })
    await userEvent.click(toogleButton)
    expect(addNetworkVenueReq).toHaveBeenCalled()
  })

  it('opens drawer when Edit VLAN & Radio action is clicked', async () => {
    // eslint-disable-next-line max-len
    const params = { tenantId: 'bb40743f58d94384bd90be5541b6e6fb', apGroupId: '5eef04c02ad0431188dad49057bd6c5a' }
    render(
      <Provider>
        {/* eslint-disable-next-line max-len */}
        <ApGroupNetworksTable venueId='bb40743f58d94384bd90be5541b6e6fb' apGroupId='5eef04c02ad0431188dad49057bd6c5a' />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      })

    services.useEnhanceVenueNetworkTableV2Query = jest.fn().mockImplementation(() => {
      return { data: venueNetworkTableV2QueryWithApGroupMock }
    })

    await screen.findByText('Add Network')
    await screen.findByText('AP Group')

    const row = await screen.findByRole('row', { name: /standby/i })
    await userEvent.click(row)

    const editButton = await screen.findByText(/edit vlan & radio/i)
    await userEvent.click(editButton)

    expect(screen.getByTestId('apgroup-network-vlan-radio-drawer')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('drawer-save-button'))
  })
})

