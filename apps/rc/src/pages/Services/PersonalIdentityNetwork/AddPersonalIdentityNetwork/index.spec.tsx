/* eslint-disable max-len */
import { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import AddNetworkSegmentation from '.'

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

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'

describe('Add PersonalIdentityNetwork', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.createNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(<AddNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: createNsgPath }
    })
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step5
    await screen.findByTestId('AccessSwitchForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await screen.findByTestId('SummaryForm')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(<AddNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: createNsgPath }
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
})
