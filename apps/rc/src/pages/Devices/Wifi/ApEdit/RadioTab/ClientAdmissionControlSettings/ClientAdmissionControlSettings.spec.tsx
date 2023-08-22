import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { venueApi, apApi }                from '@acx-ui/rc/services'
import { WifiUrlsInfo, CommonUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApEditContext, ApDataContext } from '../..'
import {
  venuelist,
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

describe('Ap Client Admission Control', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venuelist.data[0]))),
      rest.get(
        WifiUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockVenueClientAdmissionControl))),
      rest.get(
        WifiUrlsInfo.getApClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockApClientAdmissionControl))),
      rest.get(
        WifiUrlsInfo.updateApClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.delete(
        WifiUrlsInfo.deleteApClientAdmissionControl.url,
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
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <Form>
              <ClientAdmissionControlSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByTestId('client-admission-control-enable-read-only-24g'))
      .toHaveTextContent('Off')
    expect(await screen.findByTestId('client-admission-control-enable-read-only-50g'))
      .toHaveTextContent('Off')
  })

  it('should render correctly when use custom settings', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApClientAdmissionControl.url,
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
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <Form>
              <ClientAdmissionControlSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByTestId('client-admission-control-enable-24g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-enable-50g')).toBeVisible()
    expect(screen.queryByTestId('client-admission-control-min-client-count-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-count-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-50g'))
      .not.toBeInTheDocument()
  })
})
