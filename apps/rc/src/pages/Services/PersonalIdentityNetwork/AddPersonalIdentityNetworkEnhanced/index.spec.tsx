/* eslint-disable max-len */
import { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import AddPersonalIdentityNetworkEnhanced from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../PersonalIdentityNetworkForm/Prerequisite', () => ({
  Prerequisite: () => <div data-testid='Prerequisite' />
}))
jest.mock('../PersonalIdentityNetworkForm/GeneralSettingsForm', () => ({
  GeneralSettingsForm: () => <div data-testid='GeneralSettingsForm' />
}))
jest.mock('../PersonalIdentityNetworkForm/NetworkTopologyForm', () => ({
  Wireless: 'Wireless',
  NetworkTopologyForm: () => <div data-testid='NetworkTopologyForm' />
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
  PersonalIdentityNetworkFormDataProvider: ({ children }: { children: ReactNode }) =>
    <div data-testid='PersonalIdentityNetworkFormDataProvider' children={children} />
}))
jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn(),
  useEdgePinActions: () => ({
    addPin: (req: RequestPayload) => new Promise((resolve) => {
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

describe('Add Enhanced PersonalIdentityNetwork', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
  })

  it('should create PersonalIdentityNetwork with default steps', async () => {
    render(<AddPersonalIdentityNetworkEnhanced />, {
      wrapper: Provider,
      route: { params, path: createPinPath }
    })
    // Prerequisite step
    await screen.findByTestId('Prerequisite')
    await userEvent.click(await screen.findByRole('button', { name: 'Start' }))
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('NetworkTopologyForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // step 5
    await screen.findByTestId('SummaryForm')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(<AddPersonalIdentityNetworkEnhanced />, {
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

    await screen.findByTestId('Prerequisite')
    expect(screen.queryByTestId('GeneralSettingsForm')).toBeNull()
  })
})
