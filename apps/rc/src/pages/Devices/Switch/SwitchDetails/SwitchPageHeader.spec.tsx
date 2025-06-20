import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi, switchApi } from '@acx-ui/rc/services'
import {
  Switch,
  SwitchStatusEnum,
  SwitchUrlsInfo,
  SwitchViewModel,
  SWITCH_TYPE
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { render, screen, mockServer, waitFor } from '@acx-ui/test-utils'
import { SwitchScopes, UseQueryResult }        from '@acx-ui/types'
import { getUserProfile, setUserProfile }      from '@acx-ui/user'


import { jwtToken, switchDetailsContextData } from './__tests__/fixtures'
import SwitchPageHeader                       from './SwitchPageHeader'

import { SwitchDetailsContext } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  SwitchCliSession: ({ modalState }: { modalState: boolean }) =>
    modalState && <div data-testid='switch-cli-session'></div>
}))

const params = {
  tenantId: 'tenantId',
  switchId: 'switchId',
  serialNumber: 'serialNumber'
}

const stackDetailsContextData = {
  switchData: {
    id: 'id',
    venueId: 'venue-id',
    name: 'Switch - FEK3230S0C5',
    stackMembers: []
  },
  switchQuery: {
    refetch: jest.fn()
  } as unknown as UseQueryResult<Switch>,
  switchDetailHeader: {
    configReady: true,
    name: 'Switch - FEK3230S0C5',
    isStack: true,
    switchMac: '58:fb:96:0e:bc:f8',
    switchName: 'ICX7150-C12 Router',
    serialNumber: 'FEK3230S0C5',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    id: 'id',
    venueId: 'venue-id',
    stackMembers: [],
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER,
    unitId: 1
  },
  switchDetailViewModelQuery: {
    refetch: jest.fn()
  } as unknown as UseQueryResult<SwitchViewModel>,
  currentSwitchOperational: true,
  switchName: ''
}

const switchOnlineData = {
  data: [
    {
      cliApplied: false,
      configReady: true,
      deviceStatus: 'ONLINE',
      id: '58:fb:96:0e:bc:f8',
      serialNumber: 'FEK3230S0C5',
      syncDataEndTime: '2023-01-23T07:53:36Z',
      syncDataId: '',
      syncedSwitchConfig: true
    }
  ]
}

const switchLoadingData = {
  data: [
    {
      cliApplied: false,
      configReady: true,
      deviceStatus: 'ONLINE',
      id: '58:fb:96:0e:bc:f8',
      serialNumber: 'FEK3230S0C5',
      syncDataEndTime: '2023-01-23T08:34:38Z',
      syncDataId: '1674462867508',
      syncedSwitchConfig: true
    }
  ]
}

const mockReboot = jest.fn()
const mockDeleteSwitch = jest.fn()

describe('SwitchPageHeader', () => {
  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())
    mockReboot.mockClear()
    mockDeleteSwitch.mockClear()
    mockServer.use(
      rest.get( SwitchUrlsInfo.getJwtToken.url,
        (_, res, ctx) => res(ctx.json(jwtToken))),
      rest.post( SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchOnlineData))),
      rest.post(
        SwitchUrlsInfo.reboot.url,
        (_, res, ctx) => {
          mockReboot()
          return res(ctx.json({}))
        }),
      rest.delete(
        SwitchUrlsInfo.deleteSwitches.url,
        (_, res, ctx) => {
          mockDeleteSwitch()
          return res(ctx.json({ requestId: '123' }))
        }
      )
    )
  })
  it('should render switch correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    expect(await screen.findAllByRole('menuitem')).toHaveLength(4)
    await screen.findByText('Reboot Switch')
  })

  it('should render switch breadcrumb correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Switches')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /switch list/i
    })).toBeTruthy()
  })

  it('should click switch reboot correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    expect(await screen.findAllByRole('menuitem')).toHaveLength(4)
    await userEvent.click(await screen.findByText('Reboot Switch'))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await screen.findByRole('button', { name: /reboot/i }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    expect(mockReboot).toBeCalledTimes(1)
  })

  it('should click delete switch correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('Delete Switch'))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await screen.findByRole('button', {
      name: /delete switch/i
    }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    expect(mockDeleteSwitch).toBeCalledTimes(1)
  })

  it('should click switch CLI session correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('CLI Session'))
    expect(await screen.findByTestId('switch-cli-session')).toBeVisible()
  })

  it.skip('should click sync data correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('Sync Data'))
  })

  it.skip('should load sync data correctly', async () => {
    mockServer.use(
      rest.post( SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchLoadingData)))
    )
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
  })

  it('should render stack correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: stackDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
    expect(await screen.findByTestId('switch-status')).toBeVisible()

    await userEvent.click(await screen.findByText('More Actions'))
    expect(await screen.findAllByRole('menuitem')).toHaveLength(5)
  })

  describe('should render correctly when abac is enabled', () => {
    it('has permission', async () => {
      setUserProfile({
        ...getUserProfile(),
        abacEnabled: true,
        isCustomRole: true,
        scopes: [SwitchScopes.READ, SwitchScopes.UPDATE]
      })

      render(<Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <SwitchPageHeader />
        </SwitchDetailsContext.Provider>
      </Provider>, { route: { params } })

      expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
      expect(await screen.findByTestId('switch-status')).toBeVisible()

      await userEvent.click(await screen.findByText('More Actions'))
      expect(await screen.findAllByRole('menuitem')).toHaveLength(3)
    })

    it('has no permission', async () => {
      setUserProfile({
        ...getUserProfile(),
        abacEnabled: true,
        isCustomRole: true,
        scopes: [SwitchScopes.READ]
      })

      render(<Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <SwitchPageHeader />
        </SwitchDetailsContext.Provider>
      </Provider>, { route: { params } })

      expect(await screen.findByText(/Switch - FEK3230S0C5/)).toBeVisible()
      expect(await screen.findByTestId('switch-status')).toBeVisible()
      expect(screen.queryByText('More Actions')).toBeNull()
    })
  })
})
