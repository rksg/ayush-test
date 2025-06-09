import userEvent from '@testing-library/user-event'

import { RadioCardCategory }                                                                                             from '@acx-ui/components'
import { Features }                                                                                                      from '@acx-ui/feature-toggle'
import { IncompatibilityFeatures, ServiceType, UnifiedServiceCategory, UnifiedServiceSourceType, useIsEdgeFeatureReady } from '@acx-ui/rc/utils'
import { Provider }                                                                                                      from '@acx-ui/store'
import { render, screen }                                                                                                from '@acx-ui/test-utils'

import { mockedAvailableUnifiedServicesList } from './__tests__/fixtures'

import { ServiceCatalog } from '.'

const mockedUseIsWifiCallingProfileLimitReached = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApCompatibilityToolTip: (props: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip' onClick={props.onClick}/>,
  EdgeCompatibilityDrawer: (props: { featureName: IncompatibilityFeatures, visible: boolean }) =>
    // eslint-disable-next-line max-len
    <div data-testid='EdgeCompatibilityDrawer' style={{ display: props.visible ? 'block' : 'none' }}>
      {props.featureName}
    </div>,
  useIsWifiCallingProfileLimitReached: () => mockedUseIsWifiCallingProfileLimitReached()
}))

const mockedUseAvailableUnifiedServicesList = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useAvailableUnifiedServicesList: () => mockedUseAvailableUnifiedServicesList(),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('./useUnifiedServiceSearchFilter', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUnifiedServiceSearchFilter: (list: any) => ({
    setSearchTerm: jest.fn(),
    setFilters: jest.fn(),
    setSortOrder: jest.fn(),
    filteredServices: list
  })
}))
jest.mock('../UnifiedServiceCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnifiedServiceCard: ({ unifiedService, helpIcon }: any) => (
    <>
      <div>ServiceCard: {unifiedService.type}</div>
      <div>{helpIcon}</div>
      { unifiedService.isBetaFeature && <div>beta feature</div> }
    </>
  )
}))
jest.mock('./ServicesToolBar', () => ({
  ServicesToolBar: () => <div>ServicesToolBar</div>,
  ServiceSortOrder: {
    ASC: 'asc',
    DESC: 'desc'
  }
}))

describe('ServiceCatalog', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  beforeEach(() => {
    mockedUseIsWifiCallingProfileLimitReached.mockReturnValue({ isLimitReached: false })
    mockedUseAvailableUnifiedServicesList.mockReturnValue(mockedAvailableUnifiedServicesList)
  })

  it('should render service catalog', async () => {
    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    const targetService1 = mockedAvailableUnifiedServicesList[0]
    const targetService2 = mockedAvailableUnifiedServicesList[1]

    expect(screen.getByText('Service Catalog')).toBeInTheDocument()
    expect(screen.getByText('ServicesToolBar')).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService1.type}`)).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService2.type}`)).toBeInTheDocument()
  })

  describe('Edge SD-LAN', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

      mockedUseAvailableUnifiedServicesList.mockReturnValue([
        ...mockedAvailableUnifiedServicesList,
        {
          type: ServiceType.EDGE_SD_LAN,
          sourceType: UnifiedServiceSourceType.SERVICE,
          label: 'SD-LAN',
          description: 'SD-LAN Description',
          route: '/services/sd-lan',
          products: [RadioCardCategory.EDGE],
          category: UnifiedServiceCategory.NETWORK_SERVICES
        }
      ])
    })

    it('should show Edge SD-LAN compatibility component', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      const tooltip = await screen.findByTestId('ApCompatibilityToolTip')
      await userEvent.click(tooltip)
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.SD_LAN)
    })
  })

  describe('Edge mDNS', () => {
    beforeEach(() => {
      mockedUseAvailableUnifiedServicesList.mockReturnValue([
        ...mockedAvailableUnifiedServicesList,
        {
          type: ServiceType.EDGE_MDNS_PROXY,
          sourceType: UnifiedServiceSourceType.SERVICE,
          label: 'Edge mDNS Proxy',
          description: 'Edge mDNS Proxy Description',
          route: '/services/edge-mdnsproxy',
          products: [RadioCardCategory.EDGE],
          category: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING,
          isBetaFeature: true
        }
      ])
    })

    it('should show BetaIndicator when Edge mDNS is beta feature', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(await screen.findByText('beta feature')).toBeVisible()
    })
  })
})
