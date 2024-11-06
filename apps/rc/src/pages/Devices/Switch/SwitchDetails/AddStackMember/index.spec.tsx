import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { SwitchDetailsContext }     from '../'
import { editStackDetail }          from '../../__tests__/fixtures'
import { switchDetailsContextData } from '../__tests__/fixtures'

import AddStackMember from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const editStackData = {
  id: 'FJN3227U0G0',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  enableStack: true,
  igmpSnooping: 'none',
  jumboMode: false,
  dhcpClientEnabled: true,
  dhcpServerEnabled: false,
  rearModule: 'none'
}

describe('Add Stack Member Form', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'serial-number',
    action: 'add'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(editStackData))),
      rest.put(SwitchUrlsInfo.updateSwitch.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' })))
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()
  })
  it('should render add and delete member field correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    await userEvent.type(serialNumber1, 'FEK4124R20X')
    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    const serialNumber2 = await screen.findByTestId(/serialNumber2/)
    await userEvent.type(serialNumber2, 'FEK4124R21X')
    await userEvent.click(await screen.findByTestId('deleteBtn2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(await screen.findByText('ICX7150-C12P')).toBeVisible()
  })
  it('should render not support stacking correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    await userEvent.type(serialNumber1, 'FMG4124R20X')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(
      // eslint-disable-next-line max-len
      await screen.findByText('This switch model does not support stacking. Add it as a standalone switch.')
    ).toBeVisible()
  })
  it('should render invalid serial number correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    await userEvent.type(serialNumber1, 'aaa')

    expect(await screen.findByText('Serial number is invalid')).toBeVisible()
  })
  it('should render none unique serial number message correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    await userEvent.type(serialNumber1, 'FEK4124R21X')

    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    const serialNumber2 = await screen.findByTestId(/serialNumber2/)
    await userEvent.type(serialNumber2, 'FEK4124R21X')

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(
      await screen.findAllByText('Serial number is invalid since it\'s not unique in stack')
    ).not.toBeNull()
  })

  it('should render belong to the same family message correctly', async () => {
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <AddStackMember
            visible={true}
            setVisible={jest.fn()}
            maxMembers={3}
            venueFirmwareVersion='09010h_rc1'
          />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    await userEvent.type(serialNumber1, 'FNC3224R0AG')

    expect(
      await screen.findByText('All switch models should belong to the same family.')
    ).toBeVisible()
  })
})
