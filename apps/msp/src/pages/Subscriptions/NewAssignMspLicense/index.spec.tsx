import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }                             from '@acx-ui/msp/utils'
import { EntitlementDeviceType, LicenseUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                                                 from '@acx-ui/store'
import { fireEvent, logRoles, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { NewAssignMspLicense } from '.'


const assignmentSummary =
[
  {
    quantity: 12,
    purchasedQuantity: 20,
    courtesyQuantity: 0,
    usedQuantity: 2,
    usedQuantityForOwnAssignment: 1,
    isTrial: false,
    licenseType: EntitlementDeviceType.APSW,
    remainingLicenses: 8,
    usageType: 'ASSIGNED',
    remainingQuantity: 8
  },
  {
    quantity: 12,
    purchasedQuantity: 20,
    courtesyQuantity: 0,
    usedQuantity: 2,
    usedQuantityForOwnAssignment: 1,
    isTrial: true,
    licenseType: EntitlementDeviceType.APSW,
    remainingLicenses: 8,
    usageType: 'ASSIGNED',
    remainingQuantity: 8
  },
  {
    quantity: 12,
    purchasedQuantity: 20,
    courtesyQuantity: 0,
    usedQuantity: 2,
    usedQuantityForOwnAssignment: 1,
    isTrial: false,
    licenseType: EntitlementDeviceType.SLTN_TOKEN,
    remainingLicenses: 8,
    usageType: 'ASSIGNED',
    remainingQuantity: 8
  },
  {
    quantity: 12,
    purchasedQuantity: 20,
    courtesyQuantity: 0,
    usedQuantity: 2,
    usedQuantityForOwnAssignment: 1,
    isTrial: true,
    licenseType: EntitlementDeviceType.SLTN_TOKEN,
    remainingLicenses: 8,
    usageType: 'ASSIGNED',
    remainingQuantity: 8
  }
]

const assignmentHistory =[
  {
    licenseType: 'APSW',
    quantity: 11,
    createdDate: 'Fri Mar 07 07:55:19 UTC 2025',
    revokedDate: '',
    id: 418186,
    isTrial: true,
    effectiveDate: 'Fri Mar 07 07:55:19 UTC 2025',
    expirationDate: 'Sun Apr 06 06:00:14 UTC 2025',
    status: 'VALID'
  },
  {
    licenseType: 'APSW',
    quantity: 11,
    createdDate: 'Fri Mar 07 07:55:19 UTC 2025',
    revokedDate: '',
    id: 418187,
    isTrial: false,
    effectiveDate: 'Fri Mar 07 07:55:19 UTC 2025',
    expirationDate: 'Sun Apr 06 06:00:14 UTC 2025',
    status: 'VALID'
  },
  {
    licenseType: 'SLTN_TOKEN',
    quantity: 11,
    createdDate: 'Fri Mar 07 07:55:19 UTC 2025',
    revokedDate: '',
    id: 418189,
    isTrial: true,
    effectiveDate: 'Fri Mar 07 07:55:19 UTC 2025',
    expirationDate: 'Sun Apr 06 06:00:14 UTC 2025',
    status: 'VALID'
  },
  {
    licenseType: 'SLTN_TOKEN',
    quantity: 2,
    createdDate: 'Fri Mar 07 07:55:20 UTC 2025',
    revokedDate: '',
    id: 418190,
    isTrial: false,
    effectiveDate: 'Fri Mar 07 07:55:20 UTC 2025',
    expirationDate: 'Sat Apr 05 17:12:10 UTC 2025',
    status: 'VALID'
  }
]



const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-20T12:33:37.101+00:00').getTime()
})

const assignmentSummaryMockFn = jest.fn()

describe('NewAssignMspLicense', () => {
  let params: { tenantId: string, mspEcTenantId: string, action: string }
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.addMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 123 }))
      ),
      rest.post(
        MspUrlsInfo.addMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 123 }))
      ),
      rest.patch(
        MspUrlsInfo.updateMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 466 }))
      ),
      rest.patch(
        MspRbacUrlsInfo.updateMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 456 }))
      ),
      rest.delete(
        MspUrlsInfo.deleteMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 789 }))
      ),
      rest.delete(
        MspRbacUrlsInfo.deleteMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 789 }))
      ),
      rest.post(LicenseUrlsInfo.getMspEntitlementSummary.url,
        (req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json({ data: assignmentSummary }))
        }
      ),
      rest.post(MspRbacUrlsInfo.getMspAssignmentHistory.url,
        (req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json({ data: assignmentHistory }))
        }
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      action: 'edit'
    }
  },
  afterEach(() => {
    jest.clearAllMocks()
  }))
  it('should render correctly for add mode', async () => {
    mockServer.use(rest.post(MspRbacUrlsInfo.getMspAssignmentHistory.url,
      (req, res, ctx) => {
        assignmentSummaryMockFn()
        return res(ctx.json({}))
      }
    ))
    params.action = 'add'
    render(
      <Provider>
        <NewAssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('heading', { name: 'Assign Subscriptions' } )).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Device Networking Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Trial Licenses' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    const input = screen.getAllByRole('spinbutton')[1]
    await fireEvent.change(input, { target: { value: '-1' } })

    await waitFor(async () => {
      await expect(screen.getByText('Number should be between 0 and 8')).toBeVisible()
    })
    logRoles(document.body)
    const _input = screen.getAllByRole('spinbutton')[0]
    const input1 = screen.getAllByRole('spinbutton')[1]
    const input2 = screen.getAllByRole('spinbutton')[2]
    const input3 = screen.getAllByRole('spinbutton')[3]
    await fireEvent.change(_input, { target: { value: '7' } })
    await fireEvent.change(input1, { target: { value: '1' } })
    await fireEvent.change(input2, { target: { value: '2' } })
    await fireEvent.change(input3, { target: { value: '3' } })


    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  })

  it('should render correctly for edit mode', async () => {
    render(
      <Provider>
        <NewAssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('heading', { name: 'Assign Subscriptions' } )).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Device Networking Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Trial Licenses' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    const input = screen.getAllByRole('spinbutton')[0]

    const input1 = screen.getAllByRole('spinbutton')[1]
    const input2 = screen.getAllByRole('spinbutton')[2]
    const input3 = screen.getAllByRole('spinbutton')[3]
    await fireEvent.change(input, { target: { value: '0' } })
    await fireEvent.change(input1, { target: { value: '0' } })
    await fireEvent.change(input2, { target: { value: '2' } })
    await fireEvent.change(input3, { target: { value: '2' } })


    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  })

  it('should change date filters', async () => {
    await render(
      <Provider>
        <NewAssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('heading', { name: 'Assign Subscriptions' } )).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Device Networking Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Paid Licenses' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Solution Tokens Trial Licenses' })).toBeVisible()

    const combos = screen.getAllByRole('combobox')

    await userEvent.click(combos[1])

    const options = await screen.findAllByRole('option')

    await userEvent.click(options[1])
    await userEvent.click(options[0])

  })


})
