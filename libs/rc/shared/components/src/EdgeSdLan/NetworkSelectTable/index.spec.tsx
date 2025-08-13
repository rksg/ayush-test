import { screen, within } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { rest }           from 'msw'

import { networkApi }                                                                                                                from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, EdgeGeneralFixtures, EdgeTunnelProfileFixtures, EdgeUrlsInfo, TunnelProfileViewData, VlanPoolRbacUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                           from '@acx-ui/store'
import { MockSelect, MockSelectProps, mockServer, render }                                                                           from '@acx-ui/test-utils'

import { mockNetworkViewmodelList } from '../__tests__/fixtures'

import { NetworkSelectTable } from './index'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: (props: MockSelectProps) => <MockSelect {...props}/>
}))

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('EdgeSdLan - NetworkSelectTable', () => {
  const mockedVenueId = 'mocked_venue_id'

  beforeEach(() => {
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_req, res, ctx) => res(ctx.json({
          data: mockNetworkViewmodelList,
          page: 0,
          totalCount: mockNetworkViewmodelList.length
        }))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_req, res, ctx) => {
          return res(ctx.json({
            fields: [
            ],
            totalCount: 0,
            page: 1,
            data: []
          }))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <NetworkSelectTable
          venueId={mockedVenueId}
        />
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
  })

  it('should activate network successfully', async () => {
    const mockedOnActivateChange = jest.fn()
    render(
      <Provider>
        <NetworkSelectTable
          venueId={mockedVenueId}
          onActivateChange={mockedOnActivateChange}
        />
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
    const row = screen.getByRole('row', { name: /MockedNetwork 1/i })
    await userEvent.click(within(row).getByRole('switch'))
    expect(mockedOnActivateChange).toBeCalledWith(
      {
        id: mockNetworkViewmodelList[0].id,
        name: mockNetworkViewmodelList[0].name,
        nwSubType: mockNetworkViewmodelList[0].nwSubType,
        vlanPool: mockNetworkViewmodelList[0].vlanPool
      },
      true
    )
  })

  it('should change tunnel profile successfully', async () => {
    const mockedOnTunnelProfileChange = jest.fn()
    render(
      <Provider>
        <Form>
          <NetworkSelectTable
            venueId={mockedVenueId}
            onTunnelProfileChange={mockedOnTunnelProfileChange}
            activated={{
              [mockedVenueId]: [{
                networkId: mockNetworkViewmodelList[3].id,
                networkName: mockNetworkViewmodelList[3].name,
                tunnelProfileId: ''
              }]
            }}
            availableTunnelProfiles={mockedTunnelProfileViewData.data as TunnelProfileViewData[]}
          />
        </Form>
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
    const row = screen.getByRole('row', { name: /MockedNetwork 4/i })
    await userEvent.selectOptions(within(row).getByRole('combobox'), 'tunnelProfile2 (VxLAN)')
    expect(mockedOnTunnelProfileChange).toBeCalledWith(
      {
        id: mockNetworkViewmodelList[3].id,
        name: mockNetworkViewmodelList[3].name,
        nwSubType: mockNetworkViewmodelList[3].nwSubType,
        vlanPool: mockNetworkViewmodelList[3].vlanPool
      },
      mockedTunnelProfileViewData.data[1].id,
      ['validation', 3]
    )
  })

  it('dsae onboard network should be disabled', async () => {
    render(
      <Provider>
        <NetworkSelectTable
          venueId={mockedVenueId}
        />
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
    const row = screen.getByRole('row', { name: /MockedNetwork 7/i })
    expect(within(row).getByRole('switch')).toBeDisabled()
  })

  it('network used in personal identity network should be disabled', async () => {
    render(
      <Provider>
        <NetworkSelectTable
          venueId={mockedVenueId}
          pinNetworkIds={['network_1']}
        />
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
    const row = screen.getByRole('row', { name: /MockedNetwork 1/i })
    expect(within(row).getByRole('switch')).toBeDisabled()
  })

  it('network used softgre should be disabled', async () => {
    render(
      <Provider>
        <NetworkSelectTable
          venueId={mockedVenueId}
          softGreNetworkIds={['network_1']}
        />
      </Provider>,
      { route: { params: { tenantId: 't-id' } } }
    )
    await basicCheck()
    const row = screen.getByRole('row', { name: /MockedNetwork 1/i })
    expect(within(row).getByRole('switch')).toBeDisabled()
  })
})

const basicCheck = async () => {
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(mockNetworkViewmodelList.length)
}