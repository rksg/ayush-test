/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi, networkApi, apApi }                           from '@acx-ui/rc/services'
import { WifiUrlsInfo, CommonUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { act, mockServer, render, screen }                       from '@acx-ui/test-utils'


import {
  mockApCompatibilitiesVenue,
  mockApCompatibilitiesNetwork,
  mockFeatureCompatibilities
} from './__test__/fixtures'

import { ApGeneralCompatibilityDrawer, ApCompatibilityType } from '.'

describe('ApGeneralCompatibilityDrawer', () => {
  const venueId = '8caa8f5e01494b5499fa156a6c565138'
  const networkId = 'c9d5f4c771c34ad2898f7078cebbb191'
  const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  const featureName = IncompatibilityFeatures.BETA_DPSK3
  let params = { tenantId, venueId, featureName: IncompatibilityFeatures.BETA_DPSK3 }
  const venueName = 'Test Venue'

  const mockedCloseDrawer = jest.fn()
  const mockGetVenue = jest.fn()

  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(apApi.util.resetApiState())
    })

    mockGetVenue.mockClear()

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (_, res, ctx) => res(ctx.json(mockApCompatibilitiesVenue))),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (_, res, ctx) => res(ctx.json(mockApCompatibilitiesNetwork))),
      rest.get(
        WifiUrlsInfo.getApFeatureSets.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockFeatureCompatibilities))),
      rest.get(
        CommonUrlsInfo.getVenue.url.split('?')[0],
        (_, res, ctx) => {
          mockGetVenue()
          return res(ctx.json({ name: venueName }))
        }),
      rest.get(
        CommonUrlsInfo.getVenuesList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({ name: venueName })))
    )
  })
  it('should fetch and display render venue correctly', async () => {
    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.VENUE}
          venueId={venueId}
          featureName={IncompatibilityFeatures.BETA_DPSK3}
          venueName={venueName}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })
    expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
    const icon = await screen.findByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should fetch and display render network correctly', async () => {
    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.NETWORK}
          networkId={networkId}
          featureName={IncompatibilityFeatures.BETA_DPSK3}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, networkId }, path: '/:tenantId' }
      })
    expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()
    expect(await screen.findByText('Wi-Fi 6')).toBeInTheDocument()
    const icon = await screen.findByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should fetch and display render alone correctly', async () => {
    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.ALONE}
          featureName={IncompatibilityFeatures.BETA_DPSK3}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })
    await screen.findByText(/To utilize the/)
    screen.getByText('DSAE')
    expect(screen.getByText('6.2.3.103.251')).toBeInTheDocument()
    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should direct display render correctly(Devices of Venue banner) with given data', async () => {
    mockedCloseDrawer.mockClear()
    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={true}
          data={mockApCompatibilitiesVenue.apCompatibilities}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    expect(await screen.findByText('Incompatibility Details')).toBeInTheDocument()
    const descriptions = await screen.findAllByText(/Some features are not enabled on specific access points in this venue/)
    expect(descriptions.length).toBe(2)
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()
    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    await userEvent.click(icon)
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })

  it('should direct display render correctly(Device of Venue)', async () => {
    const apName = 'AP-Test'
    mockedCloseDrawer.mockClear()
    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (_, res, ctx) => res(ctx.json({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(0, 1) })))
    )

    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={true}
          venueId={params.venueId}
          apId={'001001001'}
          apName={apName}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    expect(await screen.findByText(`Incompatibility Details: ${apName}`)).toBeInTheDocument()
    expect(await screen.findByText(/The following features are not enabled on this access point/)).toBeInTheDocument()
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()
    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    await userEvent.click(icon)
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })
})
