/* eslint-disable max-len */
import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

import { StepsForm } from '@acx-ui/components'
import { Network }   from '@acx-ui/rc/utils'
import { Provider }  from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockNetworkViewmodelList } from '../../../__tests__/fixtures'

import { NetworkActivationType, NetworksDrawer, NetworksDrawerProps } from './NetworksDrawer'

const mockedTunnelProfileId = 'tunnel_profile_id'
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkSelectTable: (props: {
  onActivateChange?: (
    data: Network,
    checked: boolean,
    ) => void | ((
    data: Network,
    checked: boolean,
    activated: string[],
    ) => Promise<void>),
  onTunnelProfileChange?: ((data: Network, tunnelProfileId: string, namePath?: NamePath) => void) |
    ((data: Network, tunnelProfileId: string, namePath?: NamePath) => Promise<void>),
  activated?: NetworkActivationType
  }) => <div data-testid='NetworkSelectTable'>
    <button onClick={() => props.onActivateChange?.(mockNetworkViewmodelList[0], true)}>Activate</button>
    <button onClick={() => props.onActivateChange?.(mockNetworkViewmodelList[0], false)}>Deactivate</button>
    <button onClick={() => props.onTunnelProfileChange?.(mockNetworkViewmodelList[0], mockedTunnelProfileId)}>ChangeTunnel</button>
    {JSON.stringify(props.activated)}
  </div>
}))

const mockedCloseFn = jest.fn()
const mockedSubmitFn = jest.fn()
const mockedVenueId = 'mocked_venue_id'
const mockedVenueId2 = 'mocked_venue_id_2'
const mockedVenueName = 'mocked_venue_name'
const { click } = userEvent

const MockedTargetComponent = (props: { initData?: Partial<NetworksDrawerProps> }) => {
  const { initData } = props
  return <Provider>
    <StepsForm>
      <StepsForm.StepForm>
        <NetworksDrawer
          visible={true}
          onClose={mockedCloseFn}
          onSubmit={mockedSubmitFn}
          venueId={mockedVenueId}
          venueName={mockedVenueName}
          {...initData}
        />
      </StepsForm.StepForm>
    </StepsForm>
  </Provider>
}

describe('Network Drawer', () => {

  beforeEach(() => {
    mockedCloseFn.mockReset()
    mockedSubmitFn.mockReset()
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })
    expect(screen.getByText(`${mockedVenueName}: Select Networks`)).toBeVisible()
    expect(screen.getByTestId('NetworkSelectTable')).toBeVisible()
  })

  it('should activate network successfully', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })
    await click(screen.getByRole('button', { name: 'Activate' }))
    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith({ [mockedVenueId]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: '' }] })
  })

  it('should change tunnel profile without conflict', async () => {
    render(<MockedTargetComponent
      initData={{
        activatedNetworks: {
          [mockedVenueId]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: '' }]
        }
      }}
    />, { route: { params: { tenantId: 't-id' } } })
    await click(screen.getByRole('button', { name: 'ChangeTunnel' }))
    expect(await screen.findByText(new RegExp(mockedTunnelProfileId))).toBeVisible()
    await click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSubmitFn).toBeCalledWith({ [mockedVenueId]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: mockedTunnelProfileId }] })
  })

  it('should change tunnel profile with conflict modal popup', async () => {
    render(<MockedTargetComponent
      initData={{
        activatedNetworks: {
          [mockedVenueId]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: '' }],
          [mockedVenueId2]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: '' }]
        }
      }}
    />, { route: { params: { tenantId: 't-id' } } })
    await click(screen.getByRole('button', { name: 'ChangeTunnel' }))
    const dialogs = await screen.findAllByRole('dialog')
    const conflictModal = dialogs.find(dialog => dialog.textContent?.includes('Configuration Conflict Detected'))
    expect(conflictModal).toBeVisible()
    expect(conflictModal).toHaveTextContent('Changing this setting for Network MockedNetwork 1')
    expect(conflictModal).toHaveTextContent('will also affect 1 associated venue')
    await click(within(conflictModal!).getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(conflictModal).not.toBeVisible())
    setTimeout(async () => {
      expect(await screen.findByText(new RegExp(mockedTunnelProfileId))).toBeVisible()
      await click(screen.getByRole('button', { name: 'OK' }))
      expect(mockedSubmitFn).toBeCalledWith({
        [mockedVenueId]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: mockedTunnelProfileId }] ,
        [mockedVenueId2]: [{ networkId: 'network_1', networkName: 'MockedNetwork 1', tunnelProfileId: mockedTunnelProfileId }]
      })
    })
  })
})
