import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'
import '@testing-library/jest-dom'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor,
  fireEvent
} from '@acx-ui/test-utils'

import { ErrorDisableRecoveryDrawer } from './index'

const disabledRecoveryData = {
  bpduGuard: false,
  loopDetection: false,
  packetInError: false,
  loamRemoteCriticalEvent: false,
  pvstplusProtect: false,
  bpduTunnelThreshold: false,
  lagOperationalSpeedMismatch: false,
  recoveryInterval: 300
}

describe('ErrorDisableRecoveryDrawer', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber',
    venueId: 'venue-id'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => {
          return res(ctx.json({ venueId: 'venue-id' }))
        }),
      rest.get(
        SwitchUrlsInfo.getPortDisableRecovery.url,
        (_, res, ctx) => {
          return res(ctx.json(disabledRecoveryData))
        }),
      rest.put(
        SwitchUrlsInfo.updatePortDisableRecovery.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('renders correctly when visible', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    expect(await screen.findByText('Error Disable Recovery')).toBeVisible()
  })


  it('renders error message when recoveryInterval is empty', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    fireEvent.change(
      await screen.findByTestId('recoveryInterval'), { target: { value: '' } }
    )

    fireEvent.blur(
      await screen.findByTestId('recoveryInterval')
    )

    expect(await screen.findByText('Please enter the value for the Timeout.')).toBeVisible()
  })

  it('renders error message when recoveryInterval is out of range', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    fireEvent.change(
      await screen.findByTestId('recoveryInterval'), { target: { value: '1' } }
    )

    expect(await screen.findByText('Valid range is between 10 and 65535 seconds.')).toBeVisible()
  })

  it('renders correctly with all options selected when loaded from API', async () => {
    const mockSetVisible = jest.fn()
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getPortDisableRecovery.url,
        (_, res, ctx) => {
          return res(ctx.json({
            bpduGuard: true,
            loopDetection: true,
            packetInError: true,
            loamRemoteCriticalEvent: true,
            pvstplusProtect: true,
            bpduTunnelThreshold: true,
            lagOperationalSpeedMismatch: true,
            recoveryInterval: 300
          }))
        })
    )
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    const selectorDiv = await screen.findByTestId('recoverySetting')
    await waitFor(() => expect(selectorDiv).toHaveTextContent('7 selected'))

    const applyButton = await screen.findByText('Apply')
    await userEvent.click(applyButton)
  })

  it('renders correctly when all options selected', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    const selectorDiv = await screen.findByTestId('recoverySetting')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    const selectAllOption = await screen.findByText('Select All')
    await userEvent.click(selectAllOption)

    expect(selectorDiv).toHaveTextContent('7 selected')
  })

  it('renders correctly when all options unselected', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    const selectorDiv = await screen.findByTestId('recoverySetting')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    const selectAllOption = await screen.findByText('Select All')
    await userEvent.click(selectAllOption)

    expect(selectorDiv).toHaveTextContent('7 selected')

    await userEvent.click(selectAllOption)
    expect(selectorDiv).toHaveTextContent('Select...')
  })

  it('filters out "all" option when it is already selected', async () => {
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <ErrorDisableRecoveryDrawer visible={true} setVisible={mockSetVisible} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/ports'
        }
      }
    )

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    // First, select 'all'
    const selectAllOption = await screen.findByText('Select All')
    await userEvent.click(selectAllOption)

    // Then, select another option
    const anotherOption = await screen.findByText('BPDU Guard')
    await userEvent.click(anotherOption)

    // Check that 'all' is not in the selected values
    const selectorDiv = await screen.findByTestId('recoverySetting')
    expect(selectorDiv).not.toHaveTextContent('Select All')
    expect(selectorDiv).toHaveTextContent('6 selected')
  })
})