import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { switchApi }                           from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchDetailsContext }                                                                                  from '../../..'
import { stackMembersData, standaloneFront, standaloneRear, switchDetailSatckOnline, switchDetailSwitchOffline } from '../__tests__/fixtures'

import { SwitchFrontRearView, SwitchPanelContext } from '.'

export const panelContext = {
  editPortsFromPanelEnabled: true,
  editPortDrawerVisible: false,
  setEditPortDrawerVisible: () => {},
  breakoutPortDrawerVisible: false,
  setBreakoutPortDrawerVisible: () => {},
  editBreakoutPortDrawerVisible: false,
  setEditBreakoutPortDrawerVisible: () => {},
  selectedPorts: [],
  setSelectedPorts: () => {},
  editLagModalVisible: false,
  setEditLagModalVisible: () => {},
  editLag: [],
  setEditLag: () => {}
}

describe('SwitchFrontRearView', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortlist.url,
        (_, res, ctx) => res(ctx.json(standaloneFront))),
      rest.get(SwitchUrlsInfo.getSwitchRearView.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(standaloneRear))),
      rest.put(SwitchUrlsInfo.acknowledgeSwitch.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.delete(SwitchUrlsInfo.deleteStackMember.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly : stack online', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3230S0DA',
          switchDetailHeader: switchDetailSatckOnline
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPanelContext.Provider value={panelContext}>
          <SwitchFrontRearView stackMember={stackMembersData} />
        </SwitchPanelContext.Provider>
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })

    const activeButton = await screen.findByText('Active')
    await userEvent.click(activeButton)
    expect(await screen.findByText('Stack membership')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    const rearViewButton = screen.getAllByRole('button', { name: /rear view/i })[0]
    expect(rearViewButton).toBeVisible()
    await userEvent.click(rearViewButton)
    expect(await screen.findByText('Front View')).toBeVisible()
    expect(await screen.findByText('OK')).toBeVisible()
    expect(await screen.findByTestId('FanSolid')).toBeVisible()
    const ackButton = await screen.findByText('Acknowledge')
    expect(ackButton).toBeVisible()
    await userEvent.click(ackButton)
    const removeButton = await screen.findByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)
    const deleteButton = await screen.findByRole('button', {
      name: /delete switch/i
    })
    await userEvent.click(deleteButton)
    await waitFor(() => {
      expect(deleteButton).not.toBeVisible()
    })
  })

  it('should render correctly : switch offline', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: false,
          switchName: 'FEK3230S0DA',
          switchDetailHeader: switchDetailSwitchOffline
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchPanelContext.Provider value={panelContext}>
          <SwitchFrontRearView stackMember={[]} />
        </SwitchPanelContext.Provider>
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })
    const rearViewButton = screen.getByRole('button', { name: /rear view/i })
    expect(rearViewButton).toBeDisabled()
  })
})