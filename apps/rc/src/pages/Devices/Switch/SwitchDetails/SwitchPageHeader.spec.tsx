import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchStatusEnum, SwitchUrlsInfo, SWITCH_TYPE } from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { render, screen, mockServer }                    from '@acx-ui/test-utils'

import {
  jwtToken } from './__tests__/fixtures'
import SwitchPageHeader from './SwitchPageHeader'

import { SwitchDetailsContext } from '.'

const params = {
  tenantId: 'tenantId',
  switchId: 'switchId',
  serialNumber: 'serialNumber'
}

const switchDetailsContextData = {
  switchName: '',
  currentSwitchOperational: true,
  switchDetailHeader: {
    configReady: true,
    name: 'test',
    isStack: false,
    switchMac: '58:fb:96:0e:bc:f8',
    switchName: 'ICX7150-C12 Router',
    serialNumber: 'FEK3230S0C5',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    id: 'id',
    venueId: 'venue-id',
    stackMembers: [],
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER
  }
}

const stackDetailsContextData = {
  switchName: '',
  currentSwitchOperational: true,
  switchDetailHeader: {
    configReady: true,
    name: 'test',
    isStack: true,
    switchMac: '58:fb:96:0e:bc:f8',
    switchName: 'ICX7150-C12 Router',
    serialNumber: 'FEK3230S0C5',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    id: 'id',
    venueId: 'venue-id',
    stackMembers: [],
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER
  }
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

describe('SwitchPageHeader', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get( SwitchUrlsInfo.getJwtToken.url,
        (_, res, ctx) => res(ctx.json(jwtToken))),
      rest.post( SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchOnlineData))),
      rest.post (SwitchUrlsInfo.reboot.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it.skip('should render switch correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByText('More Actions'))
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
    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Switches')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /switch list/i
    })).toBeTruthy()
  })

  it.skip('should click switch reboot correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('Reboot Switch'))
    await userEvent.click(await screen.findByRole('button', {
      name: /reboot/i
    }))
  })

  it.skip('should click delete switch correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('Delete Switch'))
    await userEvent.click(await screen.findByRole('button', {
      name: /delete switch/i
    }))
  })

  it.skip('should click switch CLI session correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByText('More Actions'))
    await userEvent.click(await screen.findByText('CLI Session'))
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
    await userEvent.click(await screen.findByText('More Actions'))
  })

  it.skip('should render stack correctly', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: stackDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPageHeader />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByText('More Actions'))
  })
})
