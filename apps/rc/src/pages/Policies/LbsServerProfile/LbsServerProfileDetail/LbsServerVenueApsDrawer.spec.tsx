import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, switchApi } from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  PolicyOperation,
  PolicyType,
  SwitchRbacUrlsInfo,
  Venue,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'

import { dummyApList, dummySwitchClientList, dummyVenue, mockedPolicyId1, mockedTenantId } from '../__tests__/fixtures'


import { LbsServerVenueApsDrawer } from './LbsServerVenueApsDrawer'


describe('LbsServerVenueApsDrawer', () => {
  const params = {
    tenantId: mockedTenantId,
    policyId: mockedPolicyId1
  }

  const path = '/:tenantId/t/' + getPolicyRoutePath({
    type: PolicyType.LBS_SERVER_PROFILE,
    oper: PolicyOperation.DETAIL
  })

  beforeEach(async () => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_req, res, ctx) => res(ctx.json(dummyApList))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_req, res, ctx) => res(ctx.json(dummySwitchClientList))
      )
    )
  })

  it('should render drawer with the given data', async () => {
    const mockSetVisible = jest.fn()

    render(
      <Provider>
        <LbsServerVenueApsDrawer
          visible={true}
          venue={dummyVenue as Venue}
          setVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(
      () => screen.queryByRole('img', { name: 'loader' }))

    const targetAp = dummyApList.data[0]

    await screen.findByRole('row', { name: new RegExp(targetAp.name) })
    expect(screen.getByTestId('LbsServerVenueApsTable')).toBeVisible()
    expect(screen.getByText('Venue 1: APs')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockSetVisible).toHaveBeenLastCalledWith(false)
  })

})