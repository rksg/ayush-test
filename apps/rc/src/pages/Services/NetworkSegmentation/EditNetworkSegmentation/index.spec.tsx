/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CatchErrorResponse,
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockNsgData,
  mockNsgSwitchInfoData
} from '../__tests__/fixtures'
import { afterSubmitMessage } from '../NetworkSegmentationForm'

import EditNetworkSegmentation from '.'

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

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const updateNsgPath = '/:tenantId/t/services/networkSegmentation/:serviceId/edit'

describe.skip('Update NetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.put(
        NetworkSegmentationUrls.updateNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      )
    )
  })

  it('should update networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditNetworkSegmentation />
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await user.click(await screen.findByText('SmartEdge'))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await user.click(await screen.findByText('Wireless Network'))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await user.click(await screen.findByText('Dist. Switch'))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await user.click((await screen.findAllByText('Access Switch'))[0])
    // step 5
    await screen.findByTestId('AccessSwitchForm')
    await user.click(await screen.findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(<EditNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: updateNsgPath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Network Segmentation'
    })).toBeVisible()
  })

  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(<EditNetworkSegmentation />, {
      wrapper: Provider,
      route: { params, path: updateNsgPath }
    })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/services/list`,
      hash: '',
      search: ''
    })
  })
})

describe('Test afterSubmitMessage', () => {
  it('afterSubmitMessage', async () => {
    const resError = [
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6, c8:03:f5:3a:95:c7] already has VXLAN config,
      Distribution Switch [c8:03:f5:3a:95:c6] will reboot after set up forwarding profile,
      [forceOverwriteReboot] set true to overwrite config and reboot.` },
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6] already has VXLAN config,
      [forceOverwriteReboot] set true to overwrite config.` },
      { message: `
      Distribution Switch [c8:03:f5:3a:95:c6] will reboot after set up forwarding profile,
      [forceOverwriteReboot] set true to reboot.` },
      { message: `The Access Switch [c0:c5:20:aa:35:fd] web auth VLAN not exist or uplink port not exist at VLAN,
      please create [WebAuth VLAN] and add uplink port or lag first.` },
      { message: '' }
    ]
    const switches = [
      ...mockNsgSwitchInfoData.distributionSwitches,
      ...mockNsgSwitchInfoData.accessSwitches,
      { id: 'c8:03:f5:3a:95:c8' }
    ]

    const expectMessage= [
      ['Distribution Switch [FMN4221R00H---DS---3, c8:03:f5:3a:95:c7] already has VXLAN config.',
        'Distribution Switch [FMN4221R00H---DS---3] will reboot after set up forwarding profile.',
        'Click Yes to proceed, No to cancel.'],
      ['Distribution Switch [FMN4221R00H---DS---3] already has VXLAN config.',
        'Click Yes to proceed, No to cancel.'],
      ['Distribution Switch [FMN4221R00H---DS---3] will reboot after set up forwarding profile.',
        'Click Yes to proceed, No to cancel.'],
      [`The Access Switch [FEK3224R09N---AS---3] web auth VLAN not exist or uplink port not exist at VLAN,
      please create [WebAuth VLAN] and add uplink port or lag first.`],
      []
    ]

    expect(afterSubmitMessage(
      { data: { errors: [resError[0]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[0].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[1]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[1].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[2]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[2].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[3]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[3].map(m=><p>{m}</p>))
    expect(afterSubmitMessage(
      { data: { errors: [resError[4]] } } as CatchErrorResponse, switches
    )).toStrictEqual(expectMessage[4].map(m=><p>{m}</p>))

  })
})
