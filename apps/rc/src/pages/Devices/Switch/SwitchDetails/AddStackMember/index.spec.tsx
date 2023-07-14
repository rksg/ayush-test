import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Modal }      from 'antd'
import { rest }       from 'msw'
import { act }        from 'react-dom/test-utils'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import {
  editStackDetail } from '../../__tests__/fixtures'

import AddStackMember from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const editStackData = {
  id: 'FEK4124R28X',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  enableStack: true,
  igmpSnooping: 'none',
  jumboMode: false,
  softDeleted: false,
  isPrimaryDeleted: false,
  sendedHostname: true,
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
    initialize()
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
        <AddStackMember visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    fireEvent.change(
      await screen.findByTestId(/serialNumber1/), { target: { value: 'FEK4124R20X' } })
  })
  it('should render add and delete member field correctly', async () => {
    render(
      <Provider>
        <AddStackMember visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    fireEvent.change(
      await screen.findByTestId(/serialNumber1/), { target: { value: 'FEK4124R20X' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    const serialNumber2 = await screen.findByTestId(/serialNumber2/)
    fireEvent.change(serialNumber2, { target: { value: 'FEK4124R21X' } })
    serialNumber2.focus()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber2.blur()
    })
    await userEvent.click(await screen.findByTestId('deleteBtn2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
  it('should render not support stacking correctly', async () => {
    render(
      <Provider>
        <AddStackMember visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    fireEvent.change(serialNumber1, { target: { value: 'FMG4124R20X' } })
    serialNumber1.focus()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber1.blur()
    })

    expect(
      await screen.findByText('Serial number is invalid since it\'s not support stacking')
    ).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
  it('should render invalid serial number correctly', async () => {
    render(
      <Provider>
        <AddStackMember visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    fireEvent.change(serialNumber1, { target: { value: 'aaa' } })
    serialNumber1.focus()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber1.blur()
    })

    expect(await screen.findByText('Serial number is invalid')).toBeVisible()
  })
  it('should render none unique serial number message correctly', async () => {
    render(
      <Provider>
        <AddStackMember visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview'
        }
      })

    expect(await screen.findByText('Add Member to Stack')).toBeVisible()

    const serialNumber1 = await screen.findByTestId(/serialNumber1/)
    fireEvent.change(serialNumber1, { target: { value: 'FEK4124R21X' } })
    serialNumber1.focus()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber1.blur()
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Add another member' }))
    const serialNumber2 = await screen.findByTestId(/serialNumber2/)
    fireEvent.change(serialNumber2, { target: { value: 'FEK4124R21X' } })
    serialNumber2.focus()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      serialNumber2.blur()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    const msg = await screen.
      findAllByText('Serial number is invalid since it\'s not unique in stack')
    expect(msg[0]).toBeVisible()
  })
})
