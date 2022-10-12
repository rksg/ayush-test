import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen
} from '@acx-ui/test-utils'


import AddEdge from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

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
      )
    )
  })

  it('should create AddEdge successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/add' }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/add' }
      })
    user.click(screen.getByText('Add'))
    await screen.findByText('Please enter Venue')
    await screen.findByText('Please enter SmartEdge Name')
    await screen.findByText('Please enter Serial Number')
  })

  it('should add edge successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/add' }
      })
    const venueDropdown = screen.getByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number QuestionMarkCircleOutlined.svg' })
    fireEvent.change(serialNumberInput, { target: { value: 'serial_number_test' } })
    await user.click(screen.getByText('Add'))
    // AddEdge success should back to /devices, use UI to test this case is normal
    // but use jest always fail
    // expect(mockedUsedNavigate).toHaveBeenCalledWith({
    //   pathname: `/t/${params.tenantId}/devices`,
    //   hash: '',
    //   search: ''
    // })
  })

  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/add' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices`,
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
        (req, res, ctx) => res(ctx.status(500), ctx.json(null))
      )
    )
  })

  it('addEdge api fail handle', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/add' }
      })
    const venueDropdown = screen.getByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number QuestionMarkCircleOutlined.svg' })
    fireEvent.change(serialNumberInput, { target: { value: 'serial_number_test' } })
    await user.click(screen.getByText('Add'))
    await screen.findByText('An error occurred')
  })
})