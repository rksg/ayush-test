/* eslint-disable max-len */
import { ReactNode } from 'react'

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { useGetEdgePinByIdQuery } from '@acx-ui/rc/services'
import {
  EdgePinFixtures,
  EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { RequestPayload }     from '@acx-ui/types'
import { CatchErrorResponse } from '@acx-ui/utils'

import { edgeClusterConfigValidationFailed } from '../__tests__/fixtures'
import { afterSubmitMessage }                from '../PersonalIdentityNetworkForm'

import EditPersonalIdentityNetwork from '.'

const { mockPinSwitchInfoData, mockPinData, mockPinStatsList } = EdgePinFixtures

const mockValidateEdgePinSwitchConfigMutation = jest.fn()
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
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  // mock API response due to all form steps are mocked
  useGetEdgePinByIdQuery: jest.fn(),
  useGetEdgePinViewDataListQuery: () => ({ data: mockPinStatsList, isLoading: false }),
  useValidateEdgePinSwitchConfigMutation: jest.fn().mockImplementation(() => [mockValidateEdgePinSwitchConfigMutation])
}))
jest.mock('../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext', () => ({
  PersonalIdentityNetworkFormDataProvider: ({ children }: { children: ReactNode }) =>
    <div data-testid='PersonalIdentityNetworkFormDataProvider' children={children} />
}))

jest.mock('@acx-ui/rc/components', () => ({
  useEdgePinActions: () => ({
    editPin: (_originData: unknown, req: RequestPayload) => new Promise((resolve) => {
      resolve(true)
      setTimeout(() => {
        (req.callback as Function)([{
          response: { id: 'mocked_service_id' }
        }])
      }, 300)
    })
  }),
  useIsEdgeFeatureReady: jest.fn()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const updatePinPath = '/:tenantId/t/services/personalIdentityNetwork/:serviceId/edit'

describe('Edit PersonalIdentityNetwork', () => {
  const params: { tenantId: string, serviceId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const mockValidateEdgeClusterConfigFn = jest.fn()

  beforeEach(() => {
    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => ({
      data: mockPinData, isLoading: false, refetch: jest.fn() }))

    mockedUsedNavigate.mockClear()
    mockValidateEdgePinSwitchConfigMutation.mockClear()
    mockValidateEdgeClusterConfigFn.mockClear()

    mockServer.use(
      rest.put(
        EdgePinUrls.updateEdgePin.url,
        (_req, res, ctx) => res(ctx.status(202))),
      rest.post(
        EdgePinUrls.validateEdgeClusterConfig.url,
        (_req, res, ctx) => {
          mockValidateEdgeClusterConfigFn()
          return res(ctx.status(202))
        })
    )
  })

  it('cancel and go back to device list', async () => {
    render(<EditPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: updatePinPath }
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should update PersonalIdentityNetwork successfully', async () => {
    const mockPinData_noSwitch = cloneDeep(mockPinData)
    mockPinData_noSwitch.distributionSwitchInfos = []
    mockPinData_noSwitch.accessSwitchInfos = []
    jest.mocked(useGetEdgePinByIdQuery).mockImplementation(() => ({
      data: mockPinData_noSwitch, isLoading: false, refetch: jest.fn() }))

    render(
      <Provider>
        <EditPersonalIdentityNetwork />
      </Provider>, {
        route: { params, path: updatePinPath }
      })
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByText('RUCKUS Edge'))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByText('Wireless Network'))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByText('Dist. Switch'))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click((await screen.findAllByText('Access Switch'))[0])
    // step 5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/services/list`,
      search: ''
    }))
  })

  it('should be blocked by switch config validation', async () => {
    render(
      <Provider>
        <EditPersonalIdentityNetwork />
      </Provider>, {
        route: { params, path: updatePinPath }
      })
    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByText('RUCKUS Edge'))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByText('Wireless Network'))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByText('Dist. Switch'))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click((await screen.findAllByText('Access Switch'))[0])
    // step 5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    // should go back step 5
    await screen.findByTestId('AccessSwitchForm')
    expect(mockedUsedNavigate).toBeCalledTimes(0)
  })

  it('should popup edge cluster config validation failed message', async () => {
    mockServer.use(
      rest.post(
        EdgePinUrls.validateEdgeClusterConfig.url,
        (_req, res, ctx) => res(ctx.status(422), ctx.json(edgeClusterConfigValidationFailed)))
    )

    render(<EditPersonalIdentityNetwork />, {
      wrapper: Provider,
      route: { params, path: updatePinPath }
    })

    // step 1
    await screen.findByTestId('GeneralSettingsForm')
    await userEvent.click(await screen.findByText('RUCKUS Edge'))
    // step 2
    await screen.findByTestId('SmartEdgeForm')
    await userEvent.click(await screen.findByText('Wireless Network'))
    // step 3
    await screen.findByTestId('WirelessNetworkForm')
    await userEvent.click(await screen.findByText('Dist. Switch'))
    // step 4
    await screen.findByTestId('DistributionSwitchForm')
    await userEvent.click((await screen.findAllByText('Access Switch'))[0])
    // step 5
    await screen.findByTestId('AccessSwitchForm')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await screen.findByRole('dialog')
    expect(await screen.findByText('Validation Error')).toBeVisible()
    expect(mockedUsedNavigate).toBeCalledTimes(0)
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
      ...mockPinSwitchInfoData.distributionSwitches,
      ...mockPinSwitchInfoData.accessSwitches,
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