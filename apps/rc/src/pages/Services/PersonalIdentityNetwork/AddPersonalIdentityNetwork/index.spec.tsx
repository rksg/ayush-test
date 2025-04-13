/* eslint-disable max-len */
import { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { EdgePinUrls }           from '@acx-ui/rc/utils'
import { Provider }              from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  mockServer
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { edgeClusterConfigValidationFailed } from '../__tests__/fixtures'

import AddPersonalIdentityNetwork from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../PersonalIdentityNetworkForm/GeneralSettingsForm', () => ({
  GeneralSettingsForm: () => <div data-testid='GeneralSettingsForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/SmartEdgeForm', () => ({
  SmartEdgeForm: () => <div data-testid='SmartEdgeForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/WirelessNetworkForm', () => ({
  WirelessNetworkForm: () => <div data-testid='WirelessNetworkForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/DistributionSwitchForm', () => ({
  DistributionSwitchForm: () => <div data-testid='DistributionSwitchForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/AccessSwitchForm', () => ({
  AccessSwitchForm: () => <div data-testid='AccessSwitchForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/SummaryForm', () => ({
  SummaryForm: () => <div data-testid='SummaryForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext', () => ({
  ...jest.requireActual('../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'),
  PersonalIdentityNetworkFormDataProvider: ({ children }: { children: ReactNode }) =>
    <div data-testid='PersonalIdentityNetworkFormDataProvider' children={children} />
}))
const mockAddPinRequest = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false),
  useEdgePinActions: () => ({
    addPin: (req: RequestPayload) => new Promise((resolve) => {
      mockAddPinRequest(req.payload)
      resolve(true)
      setTimeout(() => {
        (req.callback as Function)([{
          response: { id: 'mocked_service_id' }
        }])
      }, 300)
    })
  })
}))

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'

describe('Add PersonalIdentityNetwork', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockAddPinRequest.mockClear()

    mockServer.use(
      rest.post(
        EdgePinUrls.validateEdgeClusterConfig.url,
        (_req, res, ctx) => res(ctx.status(202)))
    )
  })

  it('should create PersonalIdentityNetwork successfully', async () => {
    render(<AddPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: createPinPath }
    })
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await screen.findByTestId('SummaryForm')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockAddPinRequest).toBeCalledWith(expect.objectContaining({
      vxlanTunnelProfileId: params.tenantId,
      edgeClusterInfo: expect.anything()
    })))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(<AddPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: createPinPath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Personal Identity Network'
    })).toBeVisible()
    await screen.findByTestId('GeneralSettingsForm')
  })

  it('should popup edge cluster config validation failed message', async () => {
    mockServer.use(
      rest.post(
        EdgePinUrls.validateEdgeClusterConfig.url,
        (_req, res, ctx) => res(ctx.status(422), ctx.json(edgeClusterConfigValidationFailed)))
    )

    render(<AddPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: createPinPath }
    })
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await screen.findByTestId('SummaryForm')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByRole('dialog')
    expect(await screen.findByText('Validation Error')).toBeVisible()
    expect(mockedUsedNavigate).toBeCalledTimes(0)
  })
})

describe('Add PersonalIdentityNetwork - L2GRE', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) => ff === Features.EDGE_L2OGRE_TOGGLE)
    mockedUsedNavigate.mockClear()
    mockAddPinRequest.mockClear()

    mockServer.use(
      rest.post(
        EdgePinUrls.validateEdgeClusterConfig.url,
        (_req, res, ctx) => res(ctx.status(202)))
    )
  })

  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
  })

  it('should create PersonalIdentityNetwork successfully', async () => {
    render(<AddPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: createPinPath }
    })

    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await screen.findByTestId('SummaryForm')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockAddPinRequest).toBeCalledWith(expect.objectContaining({
      vxlanTunnelProfileId: undefined,
      networkSegmentConfiguration: expect.anything()
    })))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })
})
