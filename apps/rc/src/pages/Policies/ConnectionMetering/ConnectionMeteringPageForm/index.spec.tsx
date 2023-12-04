
import { rest } from 'msw'

import { useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  ConnectionMeteringFormMode
} from '@acx-ui/rc/components'
import { ConnectionMetering, ConnectionMeteringUrls, NewTablePageable, NewTableResult, BillingCycleType } from '@acx-ui/rc/utils'
import { Provider }                                                                                       from '@acx-ui/store'
import { mockServer, render, screen }                                                                     from '@acx-ui/test-utils'

import ConnectionMeteringPageForm from './index'
const defaultPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}


const connectionMeterings = [{
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'profile1',
  uploadRate: 12,
  downloadRate: 5,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 1,
  unitCount: 2
}, {
  id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
  name: 'profile2',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_MONTHLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'afce7414-1c78-4312-ad5b-ae03f28dbc6c',
  name: 'profile3',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_WEEKLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'bfde7414-1c78-4312-ad5b-ae03f18dbc68',
  name: 'profile4',
  uploadRate: 10,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_NUMS_DAY' as BillingCycleType,
  billingCycleDays: 7,
  venueCount: 1,
  unitCount: 1
}
]

const list : NewTableResult<ConnectionMetering> = {
  content: connectionMeterings,
  pageable: defaultPageable,
  totalPages: 1,
  totalElements: 4,
  sort: defaultPageable.sort
}


const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

describe('ConnectionMeteringPageForm', () => {
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(ConnectionMeteringUrls.searchConnectionMeteringList.url),
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringDetail.url,
        (req, res, ctx) => {
          return res(ctx.json(list.content[0]))
        }
      ),
      rest.patch(
        ConnectionMeteringUrls.updateConnectionMetering.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render correctly for creating data usage metering', async () => {
    render(<Provider><ConnectionMeteringPageForm
      mode={ConnectionMeteringFormMode.CREATE}
    />
    </Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: ''
      }, path: '/:tenantId' }
    })
    await screen.findAllByText('Add Data Usage Metering')
  })

  it('should render correctly for editing data usage metering', async () => {
    render(<Provider><ConnectionMeteringPageForm
      mode={ConnectionMeteringFormMode.EDIT}
    />
    </Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: connectionMeterings[0].id
      }, path: '/:tenantId/:policyId' }
    })
    await screen.findAllByText('Edit Data Usage Metering')
  })
})