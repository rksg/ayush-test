/* eslint-disable max-len */
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

jest.mock('../NetworkSegmentationForm/GeneralSettingsForm', () => ({
  GeneralSettingsForm: () => <div data-testid='GeneralSettingsForm' />
}))
jest.mock('../NetworkSegmentationForm/SmartEdgeForm', () => ({
  SmartEdgeForm: () => <div data-testid='SmartEdgeForm' />
}))
jest.mock('../NetworkSegmentationForm/WirelessNetworkForm', () => ({
  WirelessNetworkForm: () => <div data-testid='WirelessNetworkForm' />
}))
jest.mock('../NetworkSegmentationForm/DistributionSwitchForm', () => ({
  DistributionSwitchForm: () => <div data-testid='DistributionSwitchForm' />
}))
jest.mock('../NetworkSegmentationForm/AccessSwitchForm', () => ({
  AccessSwitchForm: () => <div data-testid='AccessSwitchForm' />
}))
jest.mock('../NetworkSegmentationForm/SummaryForm', () => ({
  SummaryForm: () => <div data-testid='SummaryForm' />
}))

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('AddNetworkSegmentation', () => {
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
      name: 'Network Segmentation'
    })).toBeVisible()
    await screen.findByTestId('GeneralSettingsForm')
  })
})
