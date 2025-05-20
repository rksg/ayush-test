import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { WifiRbacUrlsInfo }                                      from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { r760Ap, venueData }            from '../../../../__tests__/fixtures'
import { ApDataContext, ApEditContext } from '../../index'
import { ApNetworkingContext }          from '../index'


import { SmartMonitor } from './index'

const defaultApEditCtxData = {
  editContextData: {
    tabTitle: '',
    isDirty: false,
    hasError: false,
    updateChanges: jest.fn(),
    discardChanges: jest.fn()
  },
  setEditContextData: jest.fn()
}

describe('SmartMonitor', () => {
  const defaultR760ApCtxData = { apData: r760Ap, venueData }
  const params = {
    tenantId: 'tenant-id',
    serialNumber: 'serial-number',
    venueId: 'venue-id'
  }

  beforeEach (() => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApSmartMonitor.url,
        (_, res, ctx) => res(ctx.json({
          enabled: false,
          interval: 10,
          threshold: 3,
          useVenueSettings: true
        }))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueSmartMonitor.url,
        (_, res, ctx) => res(ctx.json({
          enabled: false,
          interval: 10,
          threshold: 3
        })))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
          ...defaultApEditCtxData,
          editNetworkingContextData: {} as ApNetworkingContext,
          setEditNetworkingContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <SmartMonitor />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByText(/off/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', {
      name: /customize/i
    }))

    expect(screen.queryByText(/off/i)).toBeNull()
  })
})
