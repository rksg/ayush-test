import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { switchApi }                           from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchDetailsContext }                                                                                  from '../../..'
import { stackMembersData, standaloneFront, standaloneRear, switchDetailSatckOnline, switchDetailSwitchOffline } from '../__tests__/fixtures'

import { SwitchFrontRearView, SwitchPanelContext } from '.'

const setEditPortDrawerVisible = jest.fn()

export const panelContext = {
  editPortDrawerVisible: false,
  setEditPortDrawerVisible: () => setEditPortDrawerVisible,
  breakoutPortDrawerVisible: false,
  setBreakoutPortDrawerVisible: () => {},
  editBreakoutPortDrawerVisible: false,
  setEditBreakoutPortDrawerVisible: () => {},
  selectedPorts: [],
  setSelectedPorts: () => {},
  editLagModalVisible: false,
  setEditLagModalVisible: () => {},
  editLag: [],
  setEditLag: () => {},
  breakoutPorts: [],
  setBreakoutPorts: () => {}
}

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazySwitchPortlistQuery: () => [
    jest.fn().mockResolvedValue({
      // eslint-disable-next-line max-len
      data: require('apps/rc/src/pages/Devices/Switch/SwitchDetails/SwitchOverviewTab/SwitchOverviewPanel/__tests__/fixtures').standaloneFront
    }),
    { requestId: 'test' }
  ]
}))

describe('SwitchFrontRearView', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.SWITCH_RBAC_API && ff !== Features.SWITCH_FLEXIBLE_AUTHENTICATION
    )
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

  it('enable Flexible Authentication (base on Switch RBAC FF enabled)', async () => {
    const mockedGetFlexAuthProfiles = jest.fn()
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.SWITCH_RBAC_API || ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION
    )
    mockServer.use(
      rest.get(SwitchRbacUrlsInfo.getSwitchRearView.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(standaloneRear))
      ),
      rest.post(SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => {
          mockedGetFlexAuthProfiles()
          return res(ctx.json({ data: [] }))
        }
      )
    )

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

    const regularPorts = await screen.findAllByTestId('RegularPort')
    expect(regularPorts).toHaveLength(12)
    expect(mockedGetFlexAuthProfiles).toBeCalled()
  })
})