import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                  from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeFirmwareFixtures, VenueFixtures,
  EdgeUrlsInfo, FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import GeneralSettings from './index'

const { mockVenueOptions } = VenueFixtures
const { mockEdgeData } = EdgeGeneralFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const { mockedVenueFirmwareList } = EdgeFirmwareFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const updateRequestSpy = jest.fn()

describe('EditEdge - GeneralSettings', () => {
  let params: { tenantId: string, venueId: string, edgeClusterId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: '66e6694ca3334997998c42def9326797',
      edgeClusterId: 'cluster-1',
      serialNumber: '000000000000'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updateEdge.url,
        (_, res, ctx) => {
          updateRequestSpy()
          return res(ctx.status(202))
        }),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueFirmwareList)))
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
    const edgeNameInput = await screen.findByRole('textbox', { name: 'RUCKUS Edge Name' })
    fireEvent.change(edgeNameInput, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await screen.findByText('Please enter RUCKUS Edge Name')
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
    const edgeNameInput = await screen.findByRole('textbox', { name: 'RUCKUS Edge Name' })
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
      rest.patch(
        EdgeUrlsInfo.updateEdge.url,
        (_, res, ctx) => res(ctx.status(500), ctx.json(null))),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueFirmwareList)))
    )
  })

  it('General settings api fail handle', async () => {
    const user = userEvent.setup()
    const spyOnConsole = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(spyOnConsole)

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
    const edgeNameInput = await screen.findByRole('textbox', { name: 'RUCKUS Edge Name' })
    await user.type(edgeNameInput, 'edge_name_test')
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, 'serial_number_test')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(spyOnConsole).toBeCalled())
    // TODO
    // await screen.findAllByText('Server Error')
  })
})
