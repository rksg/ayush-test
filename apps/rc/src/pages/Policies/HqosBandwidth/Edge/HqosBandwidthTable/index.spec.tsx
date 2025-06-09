import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                        from '@acx-ui/rc/components'
import { edgeApi, edgeHqosProfilesApi }                 from '@acx-ui/rc/services'
import {
  EdgeCompatibilityFixtures,
  EdgeGeneralFixtures,
  EdgeHqosProfileFixtures,
  EdgeHqosProfilesUrls,
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

import HqosBandwidthTable from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures
const { mockEdgeHqosCompatibilities } = EdgeCompatibilityFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => {
  const rcComponents = jest.requireActual('@acx-ui/rc/components')
  return {
    SimpleListTooltip: rcComponents.SimpleListTooltip,
    TrafficClassSettingsTable: rcComponents.TrafficClassSettingsTable,
    ToolTipTableStyle: rcComponents.ToolTipTableStyle,
    useEdgeHqosCompatibilityData: () => ({
      compatibilities: mockEdgeHqosCompatibilities,
      isLoading: false
    }),
    // eslint-disable-next-line max-len
    EdgeTableCompatibilityWarningTooltip: () => <div data-testid='EdgeTableCompatibilityWarningTooltip' />,
    useIsEdgeFeatureReady: jest.fn()
  }
})

const modifiedMockEdgeHqosProfileStatusList = {
  ...mockEdgeHqosCompatibilities,
  data: mockEdgeHqosProfileStatusList.data.map((item, index) => {
    if(index === 1) {
      return {
        ...item,
        id: mockEdgeHqosCompatibilities!.compatibilities![0].serviceId
      }
    }
    return item
  })
}

describe('HqosBandwidthTable', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({
    type: PolicyType.HQOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  })
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    // eslint-disable-next-line max-len
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff !== TierFeatures.SERVICE_CATALOG_UPDATED)
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeHqosProfilesApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(modifiedMockEdgeHqosProfileStatusList))
      ),
      rest.delete(
        EdgeHqosProfilesUrls.deleteEdgeHqosProfile.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        EdgeUrlsInfo.getHqosEdgeCompatibilities.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosCompatibilities))
      )
    )
  })

  it('Should render HqosBandwidthTable successfully', async () => {
    render(
      <Provider>
        <HqosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /Test-QoS-/i })
    expect(row.length).toBe(2)
    await screen.findAllByTestId('EdgeTableCompatibilityWarningTooltip')
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <HqosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('edge hqos profile detail page link should be correct', async () => {
    render(
      <Provider>
        <HqosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const mockQosProfile = mockEdgeHqosProfileStatusList.data[0]
    const edgeQosProfileDetailLink = await screen.findByRole('link',
      { name: mockQosProfile.name }) as HTMLAnchorElement
    expect(edgeQosProfileDetailLink.href)
      .toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.HQOS_BANDWIDTH,
        oper: PolicyOperation.DETAIL,
        policyId: mockQosProfile.id
      })}`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <HqosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const mockQosProfile = mockEdgeHqosProfileStatusList.data[0]
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /Test-QoS-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.HQOS_BANDWIDTH,
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
        <HqosBandwidthTable />
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
    await user.click(screen.getByRole('button', { name: 'Delete HQoS' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('Edit and Delete button not visible', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <HqosBandwidthTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /Test-QoS-2/i })).toBeVisible()
    await user.click(within(rows[2]).getByRole('radio'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })

})
