import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi }     from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  LbsServerProfileUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  dummyTableResult,
  mockedTenantId
} from '../__tests__/fixtures'

import LbsServerProfileTable from './LbsServerProfileTable'

const tablePath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.LIST })

describe('LbsServerProfileTable', () => {
  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <LbsServerProfileTable />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()

    const targetName = dummyTableResult.data[0].lbsServerVenueName
    const row1 = await screen.findByText(targetName)

    expect(screen.getByRole('button', { name: /Add LBS Server/i })).toBeVisible()
    await userEvent.click(row1)

    const editButton = await screen.findByText('Edit')
    expect(editButton).toBeInTheDocument()
    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
  })

})
