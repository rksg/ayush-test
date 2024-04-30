import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                   from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockVenueData }                                from '../../../__tests__/fixtures'
import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import GeneralSettings from './index'

const { mockEdgeData } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const updateRequestSpy = jest.fn()

describe('EditEdge - GeneralSettings', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.put(
        EdgeUrlsInfo.updateEdge.url,
        (req, res, ctx) => {
          updateRequestSpy()
          return res(ctx.status(202))
        }
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
        <EditEdgeDataContext.Provider
          value={{
            generalSettings: mockEdgeData
          } as unknown as EditEdgeDataContextType}
        >
          <GeneralSettings />
        </EditEdgeDataContext.Provider>
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
        <EditEdgeDataContext.Provider
          value={{
            generalSettings: mockEdgeData
          } as unknown as EditEdgeDataContextType}
        >
          <GeneralSettings />
        </EditEdgeDataContext.Provider>
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
        <EditEdgeDataContext.Provider
          value={{
            generalSettings: mockEdgeData
          } as unknown as EditEdgeDataContextType}
        >
          <GeneralSettings />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/general-settings' }
      })
    const edgeNameInput = await screen.findByRole('textbox', { name: 'SmartEdge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    await user.click(applyButton)
    await waitFor(() => expect(updateRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            generalSettings: mockEdgeData
          } as unknown as EditEdgeDataContextType}
        >
          <GeneralSettings />
        </EditEdgeDataContext.Provider>
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
        <EditEdgeDataContext.Provider
          value={{
            generalSettings: mockEdgeData
          } as unknown as EditEdgeDataContextType}
        >
          <GeneralSettings />
        </EditEdgeDataContext.Provider>
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
