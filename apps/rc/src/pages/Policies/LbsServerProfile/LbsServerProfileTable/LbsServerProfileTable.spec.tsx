/* eslint-disable max-len */
import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

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
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  dummyTableResult,
  mockedTenantId
} from '../__tests__/fixtures'

import LbsServerProfileTable from './LbsServerProfileTable'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.LIST })

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('LbsServerProfileTable', () => {
  const mockDeleteFn = jest.fn()

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())
    mockDeleteFn.mockClear()

    mockServer.use(
      rest.post(
        LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.delete(
        LbsServerProfileUrls.deleteLbsServerProfile.url,
        (_, res, ctx) => {
          mockDeleteFn()
          return res(ctx.status(202))
        }
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

    const targetName = dummyTableResult.data[0].lbsServerVenueName
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add LBS Server/i })).toBeVisible()
    await waitFor(() => {
      expect(screen.queryByText(targetName)).toBeVisible()
    })
    const row1 = await screen.findByText(targetName)
    await userEvent.click(row1)

    let editButton = await screen.findByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = await screen.findByText('Delete')
    expect(deleteButton).toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
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
  })

})
