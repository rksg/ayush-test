/* eslint-disable max-len */
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { venueApi }                                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, IncompatibilityFeatures, CompatibilityType } from '@acx-ui/rc/utils'
import { Provider, store }                                            from '@acx-ui/store'
import { act, mockServer, render, screen, within }                    from '@acx-ui/test-utils'

import { mockApCompatibilitiesVenue }              from '../Ap/ApCompatibilityDrawer/__test__/fixtures'
import { CompatibilityItemProps }                  from '../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }                        from '../CompatibilityDrawer/CompatibilityItem/FeatureItem'
import { transformedMockEdgeCompatibilitiesVenue } from '../Edge/EdgeCompatibilityDrawer/__test__/fixtures'

import { CompatibilityDrawer } from './'

jest.mock('./CompatibilityItem', () => {
  const CompatibilityItemComp = jest.requireActual('../CompatibilityDrawer/CompatibilityItem')
  return {
    ...CompatibilityItemComp,
    CompatibilityItem: (props: CompatibilityItemProps) => <div data-testid='CompatibilityItem'>
      <CompatibilityItemComp.CompatibilityItem {...props}/>
    </div>
  }
})
jest.mock('./CompatibilityItem/FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('../CompatibilityDrawer/CompatibilityItem/FeatureItem')
  return {
    ...FeatureItemComp,

    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})

describe('CompatibilityDrawer', () => {
  const venueId = '8caa8f5e01494b5499fa156a6c565138'
  const networkId = 'c9d5f4c771c34ad2898f7078cebbb191'
  const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  let params = { tenantId, venueId, featureName: IncompatibilityFeatures.BETA_DPSK3 }
  const venueName = 'Test Venue'

  const mockedCloseDrawer = jest.fn()
  const mockGetVenue = jest.fn()

  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })

    mockGetVenue.mockClear()

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url.split('?')[0],
        (_, res, ctx) => {
          mockGetVenue()
          return res(ctx.json({ name: venueName }))
        })
    )
  })

  it('should render venue level correctly', async () => {
    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title='test drawer title'
          compatibilityType={CompatibilityType.VENUE}
          data={mockApCompatibilitiesVenue.apCompatibilities}
          venueId={venueId}
          featureName={IncompatibilityFeatures.BETA_DPSK3}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    screen.getByText('test drawer title')
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)

    const wifi = compatibilityItems[0]
    const features = within(wifi).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(within(wifi).getByText(/Some features are not enabled on specific access points/)).toBeInTheDocument()
    expect(within(wifi).getByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    expect(within(wifi).getByText('7.0.0.0.123')).toBeInTheDocument()
    expect(within(wifi).getByText('Wi-Fi 6')).toBeInTheDocument()
    expect(within(wifi).getByText('1 / 1')).toBeValid()

    const wifi2 = compatibilityItems[1]
    expect(within(wifi2).getByText(/Some features are not enabled on specific access points/)).toBeInTheDocument()
    expect(within(wifi2).getByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    expect(within(wifi2).getByText('6.2.3.103.250')).toBeInTheDocument()
    expect(within(wifi2).getByText('1 / 1')).toBeValid()

    const icon = screen.getByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    await userEvent.click(icon)
    expect(mockedCloseDrawer).toBeCalledTimes(1)
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should render feature level correctly', async () => {
    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title='test drawer title'
          compatibilityType={CompatibilityType.FEATURE}
          data={mockApCompatibilitiesVenue.apCompatibilities}
          venueId={venueId}
          venueName={venueName}
          featureName={IncompatibilityFeatures.BETA_DPSK3}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    screen.getByText('test drawer title')
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)

    const wifi = compatibilityItems[0]
    const description = within(wifi).getByText(/To use the/)
    expect(description).toHaveTextContent(IncompatibilityFeatures.BETA_DPSK3)
    expect(description).toHaveTextContent(venueName)

    const features = within(wifi).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(within(wifi).getByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    expect(within(wifi).getByText('7.0.0.0.123')).toBeValid()
    expect(within(wifi).getByText('1 / 1')).toBeValid()
    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should render device level correctly', async () => {
    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title=''
          compatibilityType={CompatibilityType.DEVICE}
          data={mockApCompatibilitiesVenue.apCompatibilities}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, networkId }, path: '/:tenantId' }
      })

    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)

    const wifi = compatibilityItems[0]
    expect(within(wifi).getByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    const features = within(wifi).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(within(features[0]).getByText('7.0.0.0.123')).toBeValid()
    expect(within(features[0]).getByText('1 / 1')).toBeValid()

    expect(mockGetVenue).toBeCalledTimes(0)
  })

  it('should display correctly - venue > ap table banner', async () => {
    const mockCrossDevice = cloneDeep(mockApCompatibilitiesVenue.apCompatibilities[0])
    mockCrossDevice.incompatibleFeatures![0].featureName = IncompatibilityFeatures.SD_LAN
    mockCrossDevice.incompatibleFeatures?.push(mockApCompatibilitiesVenue.apCompatibilities[1].incompatibleFeatures![0])

    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title=''
          compatibilityType={CompatibilityType.VENUE}
          data={[mockCrossDevice]}
          venueId={venueId}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    const tabs = await screen.findAllByRole('tab')
    expect(tabs[0]).toHaveTextContent('Wi-Fi')
    expect(tabs[1]).toHaveTextContent('RUCKUS Edge')

    // check wifi tab
    let compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)
    const wifi = compatibilityItems[0]
    within(wifi).getByText('EXAMPLE-FEATURE-3')
    const wifiFeatures = within(wifi).getAllByTestId('FeatureItem')
    expect(wifiFeatures.length).toBe(1)

    // check edge tab
    await userEvent.click(screen.getByRole('tab', { name: 'RUCKUS Edge' }))
    compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    // tabpane already rendered will exist.
    expect(compatibilityItems.length).toBe(2)
    const edge = compatibilityItems[1]
    within(edge).getByText('SD-LAN')
    const edgeFeatures = within(edge).getAllByTestId('FeatureItem')
    expect(edgeFeatures.length).toBe(1)
    expect(screen.queryByRole('link', { name: /RUCKUS Edge Firmware/ })).toBeNull()
  })

  it('should display correctly - venue device table > incompatible column', async () => {
    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title='incompatible on a specific device'
          compatibilityType={CompatibilityType.DEVICE}
          data={[mockApCompatibilitiesVenue.apCompatibilities[0]]}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)
    await screen.findByText(/The following features are not enabled on this access point/)
    const features = within(compatibilityItems[0]).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()
  })

  it('specific feature from diff data source on specific venue', async () => {
    // this case should use <FeatureCrossDeviceTypeCompatibility/>
    // SD-LAN incompatible data from wifi & smartEdge
    const apData = cloneDeep(mockApCompatibilitiesVenue.apCompatibilities[0])
    apData.incompatibleFeatures![0].featureName = IncompatibilityFeatures.SD_LAN
    const edgeData = transformedMockEdgeCompatibilitiesVenue.compatibilities[0]
    edgeData.incompatibleFeatures = edgeData.incompatibleFeatures?.filter(i => i.featureName === IncompatibilityFeatures.SD_LAN)
    const mockCrossDevice = [apData, edgeData]

    render(
      <Provider>
        <CompatibilityDrawer
          visible={true}
          title=''
          compatibilityType={CompatibilityType.FEATURE}
          featureName={IncompatibilityFeatures.SD_LAN}
          data={mockCrossDevice}
          venueId={venueId}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)
    const block1 = compatibilityItems[0]
    const description = within(block1).getByText(/To use the/)
    expect(description).toHaveTextContent('SD-LAN')
    expect(description).toHaveTextContent('ensure that the access points on the venue')
    const features = within(block1).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)

    const block2 = compatibilityItems[1]
    const description2 = within(block2).getByText(/To use the/)
    expect(description2).toHaveTextContent('SD-LAN')
    expect(description2).toHaveTextContent('ensure that the access points on the venue')
    const features2 = within(block2).getAllByTestId('FeatureItem')
    expect(features2.length).toBe(1)
  })
})