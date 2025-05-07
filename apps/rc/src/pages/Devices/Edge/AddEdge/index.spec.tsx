/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  EdgeErrorsFixtures,
  EdgeUrlsInfo,
  EdgeCompatibilityFixtures,
  FirmwareUrlsInfo,
  EdgeFirmwareFixtures,
  EdgeGeneralFixtures,
  VenueFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import AddEdge from './index'

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

const {
  mockValidationFailedDataWithDefinedCode,
  mockValidationFailedDataWithUndefinedCode
} = EdgeErrorsFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const { mockedVenueFirmwareList } = EdgeFirmwareFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getEnabledDialogImproved: jest.fn().mockReturnValue(false),
  isShowImprovedErrorSuggestion: jest.fn().mockReturnValue(false)
}))

describe('AddEdge', () => {
  let params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (_, res, ctx) => res(ctx.status(202))),
      rest.post(
        EdgeUrlsInfo.addEdgeCluster.url,
        (_, res, ctx) => res(ctx.status(202))),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeClusterList))),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueFirmwareList)))
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
    await screen.findByText('Please enter RUCKUS Edge Name')
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
    const edgeNameInput = await screen.findByRole('textbox', { name: 'RUCKUS Edge Name' })
    fireEvent.change(edgeNameInput, { target: { value: '12345678901234567890123456789012345678901234567890123456789012345' } })
    const serialNumberInput = screen.getByRole('textbox', { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '9612345678901234567890123456789012345' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('RUCKUS Edge Name must be up to 64 characters')).toBeVisible()
    expect(await screen.findByText('This field is invalid')).toBeVisible()
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

  it('should add edge with cluster successfully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE || ff === Features.EDGES_TOGGLE)
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
    const clusterDropdown = await screen.findByRole('combobox', { name: 'Cluster' })
    await user.click(clusterDropdown)
    await user.click(await screen.findByText('Edge Cluster 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })
    await user.type(edgeNameInput, 'edge_name_test')
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    await user.type(serialNumberInput, '967107237F423711EE948762BC9B5F795A')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    }))
  })

  it('should add edge without cluster successfully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE || ff === Features.EDGES_TOGGLE)
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
    const edgeNameInput = screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
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

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE || ff === Features.EDGES_TOGGLE)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (_, res, ctx) => res(ctx.status(422), ctx.json(mockValidationFailedDataWithDefinedCode))),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeClusterList))),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueFirmwareList)))
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
    const edgeNameInput = screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const clusterDropdown = await screen.findByRole('combobox', { name: 'Cluster' })
    await user.click(clusterDropdown)
    await user.click(await screen.findByText('Edge Cluster 1'))
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText("There's no available RUCKUS Edge license")
  })

  it('addEdge api fail with undefined error code', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdge.url,
        (req, res, ctx) => res(ctx.status(422), ctx.json(mockValidationFailedDataWithUndefinedCode))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueOptions))
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
    const clusterDropdown = await screen.findByRole('combobox', { name: 'Cluster' })
    await user.click(clusterDropdown)
    await user.click(await screen.findByText('Edge Cluster 1'))
    const edgeNameInput = screen.getByRole('textbox', { name: 'RUCKUS Edge Name' })
    fireEvent.change(edgeNameInput, { target: { value: 'edge_name_test' } })
    const serialNumberInput = screen.getByRole('textbox',
      { name: 'Serial Number' })
    fireEvent.change(serialNumberInput, { target: { value: '967107237F423711EE948762BC9B5F795A' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Undefined message')
  })
})