/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockValidationFailedDataWithDefinedCode, mockValidationFailedDataWithUndefinedCode, mockVenueData } from '../__tests__/fixtures'

import AddEdge from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

describe('AddEdge', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should create AddEdge successfully', async () => {
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeInTheDocument()
  })

  it('should be blocked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Venue')
    await screen.findByText('Please enter SmartEdge Name')
    await screen.findByText('Please enter Serial Number')
  })

  it('should be blocked when length of field value is exceed', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const edgeNameInput = await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: '12345678901234567890123456789012345678901234567890123456789012345' } })
    const serialNumberInput = screen.getByRole('textbox', { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '9612345678901234567890123456789012345' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('SmartEdge Name must be up to 64 characters')).toBeVisible()
    expect(await screen.findByText('Field must be exactly 34 characters')).toBeVisible()
  })

  it('should be blocked when serial number is invalid', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const serialNumberInput = await screen.findByRole('textbox', { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '12345' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should add edge successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    }, { replace: true }))
  })

  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/add' }
      })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})

describe('AddEdge api fail', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (req, res, ctx) => res(ctx.status(422), ctx.json(mockValidationFailedDataWithDefinedCode))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('addEdge api fail with defined error code', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText("There's no available SmartEdge license")
  })

  it('addEdge api fail with undefined error code', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (req, res, ctx) => res(ctx.status(422), ctx.json(mockValidationFailedDataWithUndefinedCode))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/add' }
      })
    const venueDropdown = await screen.findByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Undefined message')
  })
})
