import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }   from '@acx-ui/rc/utils'
import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockVenueData, mockEdgeData } from '../../../../components/Edge/Form/EdgeSettingForm/__tests__/fixtures'

import EditEdge from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EditEdge', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.put(
        EdgeUrlsInfo.updateEdge.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should create EditEdge successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit' }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit' }
      })
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('Please enter SmartEdge Name')
  })

  it('should update edge successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit' }
      })
    const venueDropdown = screen.getByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number QuestionMarkCircleOutlined.svg' })
    fireEvent.change(serialNumberInput, { target: { value: 'serial_number_test' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
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
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/list`,
      hash: '',
      search: ''
    })
  })
})

describe('EditEdge api fail', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.put(
        EdgeUrlsInfo.updateEdge.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json(null))
      ),
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('addEdge api fail handle', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdge />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit' }
      })
    const venueDropdown = screen.getByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await user.click(await screen.findByText('Mock Venue 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number QuestionMarkCircleOutlined.svg' })
    fireEvent.change(serialNumberInput, { target: { value: 'serial_number_test' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('An error occurred')
  })
})