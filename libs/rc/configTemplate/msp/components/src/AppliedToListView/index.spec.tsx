import { rest } from 'msw'

import { MspUrlsInfo }                        from '@acx-ui/msp/utils'
import { ConfigTemplate, ConfigTemplateType } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen }         from '@acx-ui/test-utils'

import { AppliedToTenantList } from '.'

// Mock dependencies
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  useConfigTemplateListContext: () => ({
    setAppliedToViewVisible: jest.fn()
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DetailsItemList: ({ title, items, isLoading, showMore }: any) => (
    <div>
      <div>{title}</div>
      <div>{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div>{items?.length || 0}</div>
      <div>{showMore ? 'Show More' : 'No Show More'}</div>
      {items?.map((item: string, index: number) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  )
}))

const mockedMspCustomerList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 't1',
      name: 'Tenant 1',
      tenantType: 'MSP_EC',
      status: 'Active'
    },
    {
      id: 't2',
      name: 'Tenant 2',
      tenantType: 'MSP_EC',
      status: 'Active'
    }
  ]
}

const mockedTemplate: ConfigTemplate = {
  id: '1',
  name: 'Template 1',
  createdOn: 1690598400000,
  createdBy: 'Author 1',
  appliedOnTenants: ['t1', 't2'],
  type: ConfigTemplateType.NETWORK,
  lastModified: 1690598400000,
  lastApplied: 1690598405000
}

describe('AppliedToTenantList', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo['getMspCustomersList'].url,
        (req, res, ctx) => res(ctx.json(mockedMspCustomerList))
      )
    )
  })

  it('should render tenant list correctly', async () => {
    render(
      <Provider>
        <AppliedToTenantList selectedTemplate={mockedTemplate} />
      </Provider>
    )

    expect(screen.getByText('Applied to')).toBeVisible()
    expect(screen.getByText('Not Loading')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
    expect(screen.getByText('No Show More')).toBeVisible()
    expect(screen.getByText('Tenant 1')).toBeVisible()
    expect(screen.getByText('Tenant 2')).toBeVisible()
  })

  it('should handle empty appliedOnTenants', () => {
    const templateWithoutTenants = {
      ...mockedTemplate,
      appliedOnTenants: []
    }

    render(
      <Provider>
        <AppliedToTenantList selectedTemplate={templateWithoutTenants} />
      </Provider>
    )

    expect(screen.getByText('Applied to')).toBeVisible()
    expect(screen.getByText('0')).toBeVisible()
    expect(screen.getByText('No Show More')).toBeVisible()
    // When appliedOnTenants is empty, the query should be skipped
    // and no API call should be made, so no loading state or data should appear
  })

  it('should show more button when total count exceeds max items', async () => {
    const largeMspCustomerList = {
      totalCount: 30, // More than maxItemsToShow (25)
      page: 1,
      data: Array.from({ length: 25 }, (_, i) => ({
        id: `t${i}`,
        name: `Tenant ${i}`,
        tenantType: 'MSP_EC',
        status: 'Active'
      }))
    }

    mockServer.use(
      rest.post(
        MspUrlsInfo['getMspCustomersList'].url,
        (req, res, ctx) => res(ctx.json(largeMspCustomerList))
      )
    )

    render(
      <Provider>
        <AppliedToTenantList selectedTemplate={mockedTemplate} />
      </Provider>
    )

    expect(await screen.findByText('25')).toBeVisible()
    expect(await screen.findByText('Show More')).toBeVisible()
  })
})
