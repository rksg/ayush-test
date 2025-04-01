/* eslint-disable max-len */
import {
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                            from '@acx-ui/components'
import { networkApi }                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, VlanPoolRbacUrls } from '@acx-ui/rc/utils'
import { Provider, store }                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetworkViewmodelList } from '../../../__tests__/fixtures'

import { NetworksDrawer, NetworksDrawerProps } from './NetworksDrawer'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('ecc2d7cf9d2342fdb31ae0e24958fcac')
}))

const mockedSetFieldValue = jest.fn()
const mockedGetNetworkViewmodelList = jest.fn()
const mockedCloseFn = jest.fn()
const mockedSubmitFn = jest.fn()
const mockedVenueId = 'mocked_venue_id'
const { click } = userEvent

const MockedTargetComponent = (props: { initData?: Partial<NetworksDrawerProps> }) => {
  const { initData } = props
  return <Provider>
    <StepsForm>
      <StepsForm.StepForm>
        <NetworksDrawer
          visible={true}
          onClose={mockedCloseFn}
          onSubmit={mockedSubmitFn}
          venueId={mockedVenueId}
          {...initData}
        />
      </StepsForm.StepForm>
    </StepsForm>
  </Provider>
}

describe('Network Drawer', () => {

  beforeEach(() => {
    mockedCloseFn.mockReset()
    mockedSubmitFn.mockReset()
    mockedSetFieldValue.mockReset()
    mockedGetNetworkViewmodelList.mockReset()

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
          mockedGetNetworkViewmodelList()
          return res(ctx.json({
            fields: [
            ],
            totalCount: 0,
            page: 1,
            data: []
          }))
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })
    await basicCheck()
  })

  it('should correctly render grey out network when the network is used by PIN', async () => {
    render(<MockedTargetComponent
      initData={{
        pinNetworkIds: ['network_1', 'network_2']
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck()

    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    const switchBtn2 = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeDisabled()
    expect(switchBtn2).toBeDisabled()
  })

  it('should correctly render in edit mode', async () => {
    render(<MockedTargetComponent
      initData={{
        tunneledNetworks: [
          { networkId: 'network_1', networkName: 'MockedNetwork 1' },
          { networkId: 'network_2', networkName: 'MockedNetwork 2' }
        ]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck()

    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    const switchBtn2 = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    expect(switchBtn2).toBeChecked()
  })

  it('should correctly activate by switcher', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck()
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    await click(within(rows[1]).getByRole('switch'))

    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith( 'mocked_venue_id', [{ networkId: 'network_2', networkName: 'MockedNetwork 2' }])
  })

  it('should correctly deactivate by switch', async () => {
    render(<MockedTargetComponent
      initData={{
        tunneledNetworks: [
          { networkId: 'network_1', networkName: 'MockedNetwork 1' },
          { networkId: 'network_2', networkName: 'MockedNetwork 2' }
        ]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await basicCheck()
    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)
    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith('mocked_venue_id', [{ networkId: 'network_2', networkName: 'MockedNetwork 2' }])
  })

  it('activatedNetworks will be default into {} when networks is not touched in create mode', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    await click(await screen.findByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith('mocked_venue_id', [])
  })
})

const basicCheck = async (): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkViewmodelList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(7)
  return rows
}