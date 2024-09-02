import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi, edgeQosProfilesApi } from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeQosProfileFixtures,
  EdgeQosProfilesUrls,
  EdgeUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import QosBandwidthTable from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeQosProfileStatusList } = EdgeQosProfileFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('QosBandwidthTable', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({
    type: PolicyType.QOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeQosProfilesApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeQosProfilesUrls.getEdgeQosProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeQosProfileStatusList))
      ),
      rest.delete(
        EdgeQosProfilesUrls.deleteEdgeQosProfile.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('Should render QosBandwidthTable successfully', async () => {
    render(
      <Provider>
        <QosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /Test-QoS-/i })
    expect(row.length).toBe(2)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <QosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('edge qos profile detail page link should be correct', async () => {
    render(
      <Provider>
        <QosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const mockQosProfile = mockEdgeQosProfileStatusList.data[0]
    const edgeQosProfileDetailLink = await screen.findByRole('link',
      { name: mockQosProfile.name }) as HTMLAnchorElement
    expect(edgeQosProfileDetailLink.href)
      .toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.QOS_BANDWIDTH,
        oper: PolicyOperation.DETAIL,
        policyId: mockQosProfile.id
      })}`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <QosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const mockQosProfile = mockEdgeQosProfileStatusList.data[0]
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /Test-QoS-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.QOS_BANDWIDTH,
        oper: PolicyOperation.EDIT,
        policyId: mockQosProfile.id
      })}`,
      hash: '',
      search: ''
    })
  })

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <QosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /Test-QoS-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "Test-QoS-1"?')
    const dialog = screen.queryByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete QoS' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

})
