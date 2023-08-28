import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import moment    from 'moment'
import { rest }  from 'msw'

import { useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                    from '@acx-ui/msp/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { AssignMspLicense } from '.'


const assignmentSummary =
  [
    {
      courtesyMspEntitlementsUsed: false,
      deviceType: 'MSP_WIFI',
      quantity: 93,
      remainingDevices: 12,
      trial: false
    },
    {
      courtesyMspEntitlementsUsed: false,
      deviceSubType: 'ICX_76',
      deviceType: 'MSP_SWITCH',
      quantity: 13,
      remainingDevices: 92,
      trial: false
    }
  ]
const devicesAssignmentSummary =
  [
    {
      courtesyMspEntitlementsUsed: false,
      deviceType: 'MSP_APSW',
      quantity: 93,
      remainingDevices: 12,
      trial: false
    }
  ]

const assignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.043Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceType: 'MSP_WIFI',
      id: 130468,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      id: 130469,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    }
  ]
const wifiAndSwitchAssignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.043Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceType: 'MSP_WIFI',
      id: 130468,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      id: 130469,
      mspEcTenantId: '3061bd56e37445a8993ac834c01e2710',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_WIFI',
      id: 130470,
      mspEcTenantId: '3061bd56e37445a8993ac834c01e2710',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    }
  ]
const deviceAssignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_APSW',
      id: 130469,
      mspEcTenantId: '3061bd56e37445a8993ac834c01e2710',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    }
  ]

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AssignMspLicense', () => {
  let params: { tenantId: string, mspEcTenantId: string, action: string }
  beforeEach(async () => {
    services.useMspAssignmentSummaryQuery = jest.fn().mockImplementation(() => {
      return { data: assignmentSummary }
    })
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: assignmentHistory }
    })
    jest.spyOn(services, 'useAddMspAssignmentMutation')
    jest.spyOn(services, 'useUpdateMspAssignmentMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.addMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 123 }))
      ),
      rest.patch(
        MspUrlsInfo.updateMspAssignment.url,
        (req, res, ctx) => res(ctx.json({ requestId: 456 }))
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
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    params.action = 'add'
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Assign Subscription')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })
  it('should render correctly for edit mode', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: wifiAndSwitchAssignmentHistory }
    })
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Assign Subscription')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })
  it('should render correctly for device agnostic flag on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: wifiAndSwitchAssignmentHistory }
    })
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Assign Subscription')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByText('Assigned Device Subscriptions')).toBeVisible()
    expect(screen.queryByText('Assigned Wi-Fi Subscription')).toBeNull()
    expect(screen.queryByText('Assigned Switch Subscription')).toBeNull()
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })
  it('should validate device input correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: '-1' } })
    await waitFor(() => {
      expect(screen.getByText('Number should be between 0 and 0')).toBeVisible()
    })
  })
  it('should validate wifi input correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: '-1' } })
    await waitFor(() => {
      expect(screen.getByText('Number should be between 0 and 12')).toBeVisible()
    })
  })
  it('should validate switch input correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const input = screen.getAllByRole('spinbutton')[1]
    await userEvent.clear(input)
    fireEvent.change(input, { target: { value: '-1' } })
    await waitFor(() => {
      expect(screen.getByText('Number should be between 0 and 92')).toBeVisible()
    })
  })
  it('expiration date dropdown should set five years date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('Five Years')).toBeVisible()
    })
    fireEvent.click(screen.getByText('Five Years'))

    const expirationDate = moment(Date.now()).add(5,'years').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('One Year')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('expiration date dropdown should set 3 years date and custom date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('Three Years')).toBeVisible()
    })
    fireEvent.click(screen.getByText('Three Years'))
    const expirationDate = moment(Date.now()).add(3,'years').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Custom date')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeVisible()
    })

    // Mouse down once on updated dropdown to have options exist
    fireEvent.mouseDown(screen.getByRole('combobox'))
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() => {
      expect(screen.getByText('Custom date')).toBeVisible()
    })
    fireEvent.click(screen.getByText('Custom date'))
    const customExpirationDate = moment(Date.now()).add(3,'years').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Three Years')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(customExpirationDate)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('expiration date dropdown should set one year date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('One Year')).toBeVisible()
    })
    fireEvent.click(screen.getByText('One Year'))
    const expirationDate = moment(Date.now()).add(1,'years').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Custom date')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('expiration date dropdown should set 90 days date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('90 Days')).toBeVisible()
    })
    fireEvent.click(screen.getByText('90 Days'))
    const expirationDate = moment(Date.now()).add(90,'days').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Custom date')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('expiration date dropdown should set 60 days date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('60 Days')).toBeVisible()
    })
    fireEvent.click(screen.getByText('60 Days'))
    const expirationDate = moment(Date.now()).add(60,'days').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Custom date')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('expiration date dropdown should set 30 days date correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const dropdown = screen.getByRole('combobox')

    // Mouse down once to have options exist
    fireEvent.mouseDown(dropdown)
    // Mouse down second time to have options be visible
    fireEvent.mouseDown(dropdown)
    await waitFor(() => {
      expect(screen.getByText('30 Days')).toBeVisible()
    })
    fireEvent.click(screen.getByText('30 Days'))
    const expirationDate = moment(Date.now()).add(30,'days').format('MM/DD/YYYY')
    await waitFor(() => {
      expect(screen.queryByText('Custom date')).toBeNull()
    })
    await waitFor(() => {
      expect(screen.getByDisplayValue(expirationDate)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('datepicker should work correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    const datepicker = screen.getByRole('img', { name: 'calendar' })
    expect(datepicker).toBeEnabled()
    await userEvent.click(datepicker)
    expect(await screen.findByRole('button', { name: moment().format('YYYY') })).toBeEnabled()
    const date = moment().add(31, 'days')
    await userEvent.click(screen.getByRole('cell', { name: date.format('YYYY-MM-DD') }))

    await userEvent.click(screen.getByRole('button', { name: 'close-circle' }))
    const datepickerInput = screen.getByPlaceholderText('Select date')
    fireEvent.change(datepickerInput, { target: { value: date.format('MM/DD/YYYY') } })
    expect(await screen.findByDisplayValue(date.format('MM/DD/YYYY'))).toBeVisible()
  })
  it('cancel button should navigate correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      })
    })
  })
  it('should save correctly for add', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    params.action = 'add'
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    const wifiInput = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(wifiInput, { target: { value: '1' } })
    const switchInput = screen.getAllByRole('spinbutton')[1]
    fireEvent.change(switchInput, { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 123 },
        status: 'fulfilled'
      })
    ]
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      }, { replace: true })
    })
    await waitFor(() => {
      expect(services.useAddMspAssignmentMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should save correctly for edit', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: wifiAndSwitchAssignmentHistory }
    })
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    const wifiInput = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(wifiInput, { target: { value: '1' } })
    const switchInput = screen.getAllByRole('spinbutton')[1]
    fireEvent.change(switchInput, { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 456 },
        status: 'fulfilled'
      })
    ]
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      }, { replace: true })
    })
    await waitFor(() => {
      expect(services.useUpdateMspAssignmentMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should save correctly for add assigned device', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useMspAssignmentSummaryQuery = jest.fn().mockImplementation(() => {
      return { data: devicesAssignmentSummary }
    })
    params.action = 'add'
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    const deviceInput = screen.getByRole('spinbutton')
    fireEvent.change(deviceInput, { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 123 },
        status: 'fulfilled'
      })
    ]
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      }, { replace: true })
    })
    await waitFor(() => {
      expect(services.useAddMspAssignmentMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should save correctly for edit assigned device', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useMspAssignmentSummaryQuery = jest.fn().mockImplementation(() => {
      return { data: devicesAssignmentSummary }
    })
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: deviceAssignmentHistory }
    })
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params }
      })

    const deviceInput = screen.getByRole('spinbutton')
    fireEvent.change(deviceInput, { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 456 },
        status: 'fulfilled'
      })
    ]
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/v/msplicenses`,
        hash: '',
        search: ''
      }, { replace: true })
    })
    await waitFor(() => {
      expect(services.useUpdateMspAssignmentMutation).toHaveLastReturnedWith(value)
    })
  })
})
