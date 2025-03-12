import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { venueApi }                                                       from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo  }                                              from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApDataContext, ApEditContext } from '../..'
import {
  resultOfGetApIotSettings,
  resultOfGetVenueApIotSettings,
  venueData } from '../../../../__tests__/fixtures'
import { apDetails } from '../../../ApDetails/__tests__/fixtures'

import { IotController } from './index'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

describe('Iot Controller', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getApIot.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApIotSettings))
      }),
      rest.get(WifiRbacUrlsInfo.getVenueIot.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetVenueApIotSettings))
      })
    )
  })
  it('Should Retrive Initial Data From Server and Render', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_MQTT_BROKER_TOGGLE)

    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
          <IotController />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/snmp' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable IoT Controller'))
    expect(await screen.findByText(/Customize/)).toBeVisible()
    expect(await screen.findByText(/IoT Controller/)).toBeVisible()
  })

  it('Should Be Able To Handle Iot Controller Switch Turn On/Off', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn(),
          setEditNetworkControlContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
            <IotController />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      })

    const customizeButton = await screen.findByRole('button', { name: 'Customize' })
    await userEvent.click(customizeButton)
    const useVenueButton = await screen.findByRole('button', { name: 'Use Venue Settings' })
    expect(useVenueButton).toBeTruthy()

    expect(await screen.findByRole('switch')).toBeEnabled()
    await userEvent.click(await screen.findByRole('switch'))
    expect(await screen.findByRole('switch')).not.toBeChecked()
  })
})
