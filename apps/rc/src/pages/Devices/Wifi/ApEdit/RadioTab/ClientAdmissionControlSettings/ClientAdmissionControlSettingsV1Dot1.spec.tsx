import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { venueApi, apApi }                from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ApEditContext, ApDataContext } from '../..'
import {
  venuelist,
  r760Ap
} from '../../../../__tests__/fixtures'

import { ClientAdmissionControlSettingsV1Dot1 } from './ClientAdmissionControlSettingsV1Dot1'

const mockClientAdmissionControl = {
  enable24G: false,
  enable50G: false,
  minClientCount24G: 10,
  minClientCount50G: 11,
  maxRadioLoad24G: 50,
  maxRadioLoad50G: 51,
  minClientThroughput24G: 20,
  minClientThroughput50G: 21
}

const mockApClientAdmissionControl_v1_1 = {
  ...mockClientAdmissionControl,
  useVenueOrApGroupSettings: true
}

const mockApGroupClientAdmissionControl = {
  ...mockClientAdmissionControl,
  useVenueSettings: false
}

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }
const venueData = venuelist.data[0]

const defaultContext = {
  editContextData: {
    tabTitle: '',
    isDirty: false,
    updateChanges: jest.fn(),
    discardChanges: jest.fn()
  },
  setEditContextData: jest.fn()
}

describe('ClientAdmissionControlSettingsV1Dot1', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApClientAdmissionControlSettings_v1_1.url,
        (_, res, ctx) => res(ctx.json(mockApClientAdmissionControl_v1_1))
      ),
      rest.put(
        WifiRbacUrlsInfo.updateApClientAdmissionControlSettings_v1_1.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupClientAdmissionControlSettings.url,
        (_, res, ctx) => res(ctx.json(mockApGroupClientAdmissionControl))
      )
    )
  })

  it('should render correctly when using inherited settings', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={defaultContext}>
          <ApDataContext.Provider value={{ apData:r760Ap, venueData }}>
            <Form>
              <ClientAdmissionControlSettingsV1Dot1 />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>,
      {
        route: { params }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // Check that the inherit settings radio is selected
    expect(await screen.findByTestId('client-admission-control-inheritSettings')).toBeChecked()

    // Check that the forms are in read-only mode (inherited settings)
    expect(await screen.findByTestId('client-admission-control-enable-read-only-24g'))
      .toHaveTextContent('Off')
    expect(await screen.findByTestId('client-admission-control-enable-read-only-50g'))
      .toHaveTextContent('Off')
  })

  it('should render correctly when using custom settings', async () => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApClientAdmissionControlSettings_v1_1.url,
        (_, res, ctx) =>
          res(ctx.json({ ...mockClientAdmissionControl, useVenueOrApGroupSettings: false }))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={defaultContext}>
          <ApDataContext.Provider value={{ apData:r760Ap, venueData }}>
            <Form>
              <ClientAdmissionControlSettingsV1Dot1 />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>,
      { route: { params } }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('client-admission-control-enable-24g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-enable-50g')).toBeVisible()
    expect(screen.queryByTestId('client-admission-control-min-client-count-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-radio-load-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-count-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-radio-load-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-50g'))
      .not.toBeInTheDocument()
  })
})