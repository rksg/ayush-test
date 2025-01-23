/* eslint-disable max-len */
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { venueApi, networkApi, apApi }                                        from '@acx-ui/rc/services'
import { WifiUrlsInfo, CommonUrlsInfo, IncompatibilityFeatures }              from '@acx-ui/rc/utils'
import { Provider, store }                                                    from '@acx-ui/store'
import { act, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'


import { CompatibilityItemProps } from '../../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }       from '../../CompatibilityDrawer/CompatibilityItem/FeatureItem'

import {
  mockApCompatibilitiesVenue,
  mockApCompatibilitiesNetwork,
  mockApFeatureCompatibilities
} from './__test__/fixtures'

import { ApGeneralCompatibilityDrawer, ApCompatibilityType } from '.'

jest.mock('../../CompatibilityDrawer/CompatibilityItem', () => {
  const CompatibilityItemComp = jest.requireActual('../../CompatibilityDrawer/CompatibilityItem')
  return {
    ...CompatibilityItemComp,
    CompatibilityItem: (props: CompatibilityItemProps) => <div data-testid='CompatibilityItem'>
      <CompatibilityItemComp.CompatibilityItem {...props}/>
    </div>
  }
})
jest.mock('../../CompatibilityDrawer/CompatibilityItem/FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('../../CompatibilityDrawer/CompatibilityItem/FeatureItem')
  return {
    ...FeatureItemComp,
    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})
const services = require('@acx-ui/rc/services')

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
        WifiUrlsInfo.getApCompatibilitiesNetwork.url,
        (_, res, ctx) => res(ctx.json(mockApCompatibilitiesNetwork))),
      rest.get(
        WifiUrlsInfo.getApFeatureSets.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockApFeatureCompatibilities))),
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
    services.useLazyGetApCompatibilitiesVenueQuery = () => [() => ({
      unwrap: () => ({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(1, 2) })
    })]
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

    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)

    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)

    const wifi = compatibilityItems[0]
    expect(await within(wifi).findByText(/AP Firmware/)).toBeInTheDocument()
    expect(within(wifi).getByText(/Test Venue/)).toBeInTheDocument()
    expect(within(wifi).getByText('6.2.3.103.250')).toBeValid()
    expect(within(wifi).getByText('1 / 1')).toBeValid()

    const icon = await screen.findByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should fetch and display render network correctly', async () => {
    services.useLazyGetApCompatibilitiesVenueQuery = () => [() => ({
      unwrap: () => ({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(1, 2) })
    })]
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
    services.useLazyGetApCompatibilitiesVenueQuery = () => [() => ({
      unwrap: () => ({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(1, 2) })
    })]
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
    await screen.findByText(/To use the/)
    screen.getByText('DSAE')
    expect(screen.getByText('6.2.3.103.251')).toBeInTheDocument()
    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should direct display render correctly(Devices of Venue banner) with given data', async () => {
    mockedCloseDrawer.mockClear()
    services.useLazyGetApCompatibilitiesVenueQuery = () => [() => ({
      unwrap: () => ({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(1, 2) })
    })]
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
    services.useLazyGetApCompatibilitiesVenueQuery = () => [() => ({
      unwrap: () => ({ apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(0, 1) })
    })]
    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={true}
          venueId={params.venueId}
          apInfo={{ serialNumber: '001001001', name: apName }}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    expect(await screen.findByText(`Incompatibility Details: ${apName}`)).toBeInTheDocument()
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(await screen.findByText(/The following features are not enabled on this access point/)).toBeInTheDocument()
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()
    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    await userEvent.click(icon)
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })

  it('should change query payload when props changed', async () => {
    const apName = 'AP-Test'
    const mockeReq = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services.useLazyGetApCompatibilitiesVenueQuery = () => [(req:any) => ({
      unwrap: () => {
        mockeReq(req.payload)
        return { apCompatibilities: mockApCompatibilitiesVenue.apCompatibilities.slice(0, 1) }
      }
    })]

    const { rerender } = render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={false}
          type={ApCompatibilityType.VENUE}
          venueId={params.venueId}
          apInfo={{ serialNumber: '', name: '' }}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    rerender(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={true}
          type={ApCompatibilityType.VENUE}
          venueId={params.venueId}
          apInfo={{ serialNumber: '001001001', name: apName }}
          onClose={mockedCloseDrawer}
        />
      </Provider>)

    expect(await screen.findByText(`Incompatibility Details: ${apName}`)).toBeInTheDocument()
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(mockeReq).toBeCalledTimes(1)
    expect(compatibilityItems.length).toBe(1)
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(await screen.findByText(/The following features are not enabled on this access point/)).toBeInTheDocument()
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()

    rerender(
      <Provider>
        <ApGeneralCompatibilityDrawer
          isMultiple
          visible={true}
          type={ApCompatibilityType.VENUE}
          venueId={params.venueId}
          apInfo={{ serialNumber: '001002222', name: 'AP2-Test' }}
          onClose={mockedCloseDrawer}
        />
      </Provider>)

    expect(await screen.findByText('Incompatibility Details: AP2-Test')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(mockeReq).toBeCalledTimes(2)
    expect(mockeReq).toHaveBeenNthCalledWith(2, {
      filters: { apIds: ['001002222'] }
    })
    await screen.findAllByTestId('CompatibilityItem')
  })

  it('should also fetch requiredFeatures and merge data', async () => {
    const mockData = cloneDeep(mockApCompatibilitiesVenue)
    mockData.apCompatibilities[0].incompatibleFeatures![0].featureName = IncompatibilityFeatures.SD_LAN
    mockData.apCompatibilities[1].incompatibleFeatures![0].featureName = IncompatibilityFeatures.TUNNEL_PROFILE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services.useLazyGetApCompatibilitiesVenueQuery = () => [(req:any) => ({
      unwrap: () => {
        const payload = req.payload.featureName
        let returnVal
        if (payload === IncompatibilityFeatures.TUNNEL_PROFILE) {
          returnVal = mockData.apCompatibilities.slice(1, 2)
        } else {
          returnVal = mockData.apCompatibilities.slice(0, 1)
        }
        return { apCompatibilities: returnVal }
      }
    })]

    render(
      <Provider>
        <ApGeneralCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.VENUE}
          venueId={venueId}
          venueName={venueName}
          featureName={IncompatibilityFeatures.SD_LAN}
          requiredFeatures={[IncompatibilityFeatures.TUNNEL_PROFILE]}
          isFeatureEnabledRegardless
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)
    expect(await within(compatibilityItems[0]).findByText(/AP Firmware/)).toBeInTheDocument()

    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const feature1 = features[0]
    expect(within(feature1).getByText('SD-LAN')).toBeValid()
    expect(within(feature1).getByText('7.0.0.0.123')).toBeValid()
    expect(within(feature1).getByText('1 / 1')).toBeValid()

    const feature2 = features[1]
    expect(within(feature2).getByText('Tunnel Profile')).toBeValid()
    expect(within(feature2).getByText('6.2.3.103.250')).toBeValid()
    expect(within(feature2).getByText('1 / 1')).toBeValid()
  })
})