import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RogueApUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { RogueAPDetectionTable } from './RogueAPDetectionTable'

const mockTableResult = {
  fields: [
    'id',
    'name',
    'numOfRules',
    'venueIds'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
      name: 'My Rogue AP Detection 1',
      numOfRules: 5,
      venueIds: []
    }
  ]
}

const mockVenueResult = {
  fields: [
    'country',
    'clients',
    'city',
    'latitude',
    'switches',
    'edges',
    'description',
    'check-all',
    'networks',
    'switchClients',
    'name',
    'cog',
    'id',
    'aggregatedApStatus',
    'longitude',
    'status'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '2e7a2dd226c8422ab62316b57f5a8631',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7690084',
      longitude: '-73.9431541',
      networks: {
        count: 1,
        names: [
          'test-psk'
        ],
        vlans: [
          1
        ]
      },
      status: '1_InSetupPhase',
      aggregatedApClientHealth: []
    }
  ]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('RogueAPDetectionTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getPoliciesList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Rogue AP Detection Policy/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RogueApUrls.deleteRogueApPolicies.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    const dialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ROGUE_AP_DETECTION,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
