import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeData, mockVenueData } from '../../../__tests__/fixtures'

import GeneralSettings from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EditEdge general settings', () => {
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

  afterEach(() => jest.restoreAllMocks())

  it('should create GeneralSettings successfully', async () => {
    render(
      <Provider>
        <GeneralSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    await screen.findByRole('combobox', { name: 'Venue' })

    // expect(asFragment()).toMatchSnapshot()
  })

  it('should be blocked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <GeneralSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    const edgeNameInput = await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('Please enter SmartEdge Name')
  })

  it('should update edge general settings successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <GeneralSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    const edgeNameInput = await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    await user.click(applyButton)
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <GeneralSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})

describe('EditEdge general settings api fail', () => {
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

  it('General settings api fail handle', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <GeneralSettings />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    const edgeNameInput = await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: 'serial_number_test' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    // TODO
    // await screen.findAllByText('Server Error')
  })
})
