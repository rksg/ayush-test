import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { switchApi }                  from '@acx-ui/rc/services'
import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { SwitchDetailsContext }                                                                                       from '../../..'
import { stackMemberStandalone, standaloneFront, standaloneRear, switchDetailSatckOnline, switchDetailSwitchOffline } from '../__tests__/fixtures'

import { SwitchFrontRearView } from '.'

describe('SwitchFrontRearView', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortlist.url,
        (_, res, ctx) => res(ctx.json(standaloneFront))),
      rest.get(SwitchUrlsInfo.getSwitchRearView.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(standaloneRear)))
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
        <SwitchFrontRearView stackMember={stackMemberStandalone} />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })

    expect(await screen.findByText('ICX7150-C12P')).toBeVisible()
    expect(await screen.findByText('Active')).toBeVisible()
    const portLabel = await screen.findByText('3')
    expect(portLabel).toBeVisible()
    const rearViewButton = screen.getByRole('button', { name: /rear view/i })
    expect(rearViewButton).toBeVisible()
    await userEvent.click(rearViewButton)
    expect(await screen.findByText('Front View')).toBeVisible()
    expect(await screen.findByText('Slot 1')).toBeVisible()
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
        <SwitchFrontRearView stackMember={[]} />
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