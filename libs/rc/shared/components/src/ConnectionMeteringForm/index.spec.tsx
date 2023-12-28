
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                                                   from '@acx-ui/feature-toggle'
import { ConnectionMetering, ConnectionMeteringUrls, NewTablePageable, NewTableResult, BillingCycleType } from '@acx-ui/rc/utils'
import { Provider }                                                                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor }                                                 from '@acx-ui/test-utils'

import { ConnectionMeteringForm, ConnectionMeteringFormMode } from './index'
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

describe('ConnectionMeteringForm', () => {
  const createConnectionMeteringApi = jest.fn()
  const updateConnectionMeteringApi = jest.fn()
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    createConnectionMeteringApi.mockClear()
    updateConnectionMeteringApi.mockClear()
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
        (req, res, ctx) => {
          updateConnectionMeteringApi()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        ConnectionMeteringUrls.createConnectionMetering.url,
        (req, res, ctx) => {
          createConnectionMeteringApi()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly for creating data usage metering', async () => {
    render(<Provider>
      <ConnectionMeteringForm
        mode={ConnectionMeteringFormMode.CREATE}
      />
    </Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: ''
      }, path: '/:tenantId' }
    })

    await screen.findAllByText('Settings')
    const addButton = await screen.findByRole('button', { name: 'Add' })
    const nameField = await screen.findByLabelText('Profile Name')
    await userEvent.type(nameField, 'new profile')
    const switches = await screen.findAllByRole('switch')
    expect(switches.length).toEqual(2)

    await userEvent.click(switches[0]) //enable data rate setting
    const enableDownloadSetting = await screen.findByRole(
      'checkbox',
      { name: 'Total Download Limit' }
    )
    await userEvent.click(enableDownloadSetting)
    const downloadLimitInput = await screen.findAllByRole('spinbutton')
    expect(downloadLimitInput.length).toEqual(1)
    await userEvent.click(downloadLimitInput[0])
    await userEvent.type(downloadLimitInput[0], '1')

    const enableUploadSetting = await screen.findByRole(
      'checkbox',
      { name: 'Total Upload Limit' }
    )
    await userEvent.click(enableUploadSetting)

    await userEvent.click(switches[1]) //enable data consumption setting

    const inputNumbers = await screen.findAllByRole('spinbutton')
    expect(inputNumbers.length).toEqual(3)
    await userEvent.type(inputNumbers[2], '1')

    const repeatSelect = await screen.findByLabelText('Consumption Cycle')
    await userEvent.click(repeatSelect)
    await userEvent.click(await screen.findByText('Repeat cycles'))

    const typeSelect = await screen.findByLabelText('Recurring Schedule')
    await userEvent.click(typeSelect)
    await userEvent.click(await screen.findByText('Weekly'))

    const enforcedSelect = await screen.findByLabelText('Action for overage data')
    await userEvent.click(enforcedSelect)
    await userEvent.click(await screen.findByText('Ignore'))

    await screen.findByRole('slider')

    fireEvent.click(addButton)
    await waitFor(() => expect(createConnectionMeteringApi).toHaveBeenCalled())
  })

  it('should render correctly for creating data usage metering in modal mode with callback',
    async () => {
      const modalCallback = jest.fn()
      render(<Provider>
        <ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.CREATE}
          useModalMode={true}
          modalCallback={modalCallback}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: ''
        }, path: '/:tenantId' }
      })
      await screen.findAllByText('Settings')
      const addButton = await screen.findByRole('button', { name: 'Add' })
      const nameField = await screen.findByLabelText('Profile Name')
      await userEvent.type(nameField, 'new profile')
      const switches = await screen.findAllByRole('switch')
      expect(switches.length).toEqual(2)

      await userEvent.click(switches[0]) //enable data rate setting
      const enableUploadSetting = await screen.findByRole(
        'checkbox',
        { name: 'Total Upload Limit' }
      )
      await userEvent.click(enableUploadSetting)
      const uploadLimitInput = await screen.findAllByRole('spinbutton')
      expect(uploadLimitInput.length).toEqual(1)
      await userEvent.click(uploadLimitInput[0])
      await userEvent.type(uploadLimitInput[0], '1')
      const enableDownloadSetting = await screen.findByRole(
        'checkbox',
        { name: 'Total Download Limit' }
      )
      await userEvent.click(enableDownloadSetting)


      await userEvent.click(switches[1]) //enable data consumption setting
      const inputNumbers = await screen.findAllByRole('spinbutton')
      expect(inputNumbers.length).toEqual(3)
      await userEvent.type(inputNumbers[2], '1')

      const repeatSelect = await screen.findByLabelText('Consumption Cycle')
      await userEvent.click(repeatSelect)
      await userEvent.click(await screen.findByText('Repeat cycles'))

      const typeSelect = await screen.findByLabelText('Recurring Schedule')
      await userEvent.click(typeSelect)
      await userEvent.click(await screen.findByText('Monthly'))

      const enforcedSelect = await screen.findByLabelText('Action for overage data')
      await userEvent.click(enforcedSelect)
      await userEvent.click(await screen.findByText('Discard'))

      await screen.findByRole('slider')

      fireEvent.click(addButton)
      await waitFor(() => expect(createConnectionMeteringApi).toHaveBeenCalled())
      await waitFor(() => expect(modalCallback).toHaveBeenCalled())
    })

  it('should render correctly for editing data usage metering', async () => {
    render(
      <Provider>
        <ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.EDIT}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: connectionMeterings[0].id
        }, path: '/:tenantId/:policyId' }
      })

    await screen.findAllByText('Settings')
    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    const nameField = await screen.findByLabelText('Profile Name')
    await userEvent.type(nameField, 'new profile name')

    const switches = await screen.findAllByRole('switch')
    expect(switches.length).toEqual(2)
    await userEvent.click(switches[0]) //disable data rate setting
    await userEvent.click(switches[1]) //disable data consumption setting
    fireEvent.click(applyButton)
    await waitFor(() => expect(updateConnectionMeteringApi).toHaveBeenCalled())
  })

  it('should cancel correctly for editing data usage metering', async () => {
    render(
      <Provider>
        <ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.EDIT}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: connectionMeterings[3].id
        }, path: '/:tenantId/:policyId' }
      })


    await screen.findAllByText('Settings')
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    const nameField = await screen.findByLabelText('Profile Name')
    await userEvent.type(nameField, 'new profile name')
    fireEvent.click(cancelButton)
    await waitFor(() => expect(updateConnectionMeteringApi).toHaveBeenCalledTimes(0))
  })
})