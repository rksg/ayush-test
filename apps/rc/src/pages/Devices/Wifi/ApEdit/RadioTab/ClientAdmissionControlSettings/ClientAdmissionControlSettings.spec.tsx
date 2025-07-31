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
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApEditContext, ApDataContext } from '../..'
import {
  venueList,
  r760Ap
} from '../../../../__tests__/fixtures'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'

const mockVenueClientAdmissionControl = {
  enable24G: false,
  enable50G: false,
  minClientCount24G: 10,
  minClientCount50G: 20,
  maxRadioLoad24G: 75,
  maxRadioLoad50G: 75,
  minClientThroughput24G: 0,
  minClientThroughput50G: 0
}

const mockApClientAdmissionControl = {
  ...mockVenueClientAdmissionControl,
  useVenueSettings: true
}


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }
const venueData = venueList.data[0]

describe('Ap Client Admission Control', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockVenueClientAdmissionControl))),
      rest.get(
        WifiRbacUrlsInfo.getApClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockApClientAdmissionControl))),
      rest.put(
        WifiRbacUrlsInfo.updateApClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly when use venue settings', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}
        >
          <ApDataContext.Provider value={{ apData: r760Ap, venueData }}>
            <Form>
              <ClientAdmissionControlSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(/Test-Venue/)
    await screen.findByText(/Customize/)

    expect(await screen.findByTestId('client-admission-control-enable-read-only-24g'))
      .toHaveTextContent('Off')
    expect(await screen.findByTestId('client-admission-control-enable-read-only-50g'))
      .toHaveTextContent('Off')
  })

  it('should render correctly when use custom settings', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json({
          ...mockApClientAdmissionControl,
          useVenueSettings: false
        })))
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}
        >
          <ApDataContext.Provider value={{ apData: r760Ap, venueData }}>
            <Form>
              <ClientAdmissionControlSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params }
      })
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
