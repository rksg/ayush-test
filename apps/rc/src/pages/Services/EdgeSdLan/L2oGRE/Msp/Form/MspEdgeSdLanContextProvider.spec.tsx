import { EdgeGeneralFixtures, EdgeTunnelProfileFixtures } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { renderHook }                                     from '@acx-ui/test-utils'

import { MspEdgeSdLanContextProvider, useMspEdgeSdLanContext } from './MspEdgeSdLanContextProvider'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockVenueTemplates = [
  {
    id: 'venue-1',
    name: 'Venue 1',
    country: 'Country 1'
  }
]

jest.mock('@acx-ui/edge/components', () => ({
  useGetAvailableTunnelTemplate: jest.fn().mockImplementation(() => ({
    availableTunnelTemplates: mockedTunnelProfileViewData.data,
    isDataLoading: false
  }))
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeClusterListQuery: jest.fn().mockImplementation(() => ({
    associatedEdgeClusters: mockEdgeClusterList.data,
    isAssociatedEdgeClustersLoading: false
  })),
  useGetVenuesTemplateListSkipRecRewriteQuery: jest.fn().mockImplementation(() => ({
    allVenueTemplates: mockVenueTemplates,
    isVenueTemplatesLoading: false
  }))
}))

describe('MspEdgeSdLanContextProvider', () => {
  it('should render correctly', () => {
    const { result } = renderHook(() => useMspEdgeSdLanContext(), {
      wrapper: ({ children }) => <Provider>
        <MspEdgeSdLanContextProvider>
          {children}
        </MspEdgeSdLanContextProvider>
      </Provider>
    })

    expect(result.current.availableTunnelTemplates).toEqual(mockedTunnelProfileViewData.data)
    expect(result.current.associatedEdgeClusters).toEqual(mockEdgeClusterList.data)
    expect(result.current.allVenueTemplates).toEqual(mockVenueTemplates)
  })
})