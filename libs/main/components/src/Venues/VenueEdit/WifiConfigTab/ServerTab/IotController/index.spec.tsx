import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { venueApi }                                                                  from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo  }                                                         from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext } from '..'
import {
  venueIot
} from '../../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../../index'


import { IotController } from '.'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('IotController', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueIot.url,
        (_, res, ctx) => res(ctx.json(venueIot)))
    )
  })

  it('should render IoT V2 UI when isIotV2Enabled is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotController />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByText(/Associate IoT Controller/)).toBeVisible()
  })

  it('should render IoT V1 UI when isIotV2Enabled is false', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotController />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByText(/Enable IoT Controller/)).toBeVisible()
  })

  it('should toggle IoT enabled state', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <IotController />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitFor(() => screen.findByText('Enable IoT Controller'))
    const switchElement = await screen.findByTestId('iot-switch')
    fireEvent.click(switchElement)
    expect(setEditContextData).toHaveBeenCalledWith(expect.objectContaining({ isDirty: true }))
  })
  // eslint-disable-next-line max-len
  it('should open the IoT Controller Drawer when "Associate IoT Controller" button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)

    render(
      <Provider>
        <Form>
          <IotController />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const associateButton = await screen.findByText(/Associate IoT Controller/)
    fireEvent.click(associateButton)
    expect(await screen.findByText('Add IoT Controller')).toBeVisible()
  })
})
