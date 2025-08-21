import '@testing-library/jest-dom'

import { Features }       from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  AddEdgeSdLan,
  EdgeSdLanDetail,
  EdgeSdLanTable,
  EditEdgeSdLan
} from './index'

// Mock the child components
jest.mock('./AddEdgeSdLan', () => ({
  AddEdgeSdLan: () => <div data-testid='add-edge-sdlan-rec'>AddEdgeSdLan Rec</div>
}))

jest.mock('./EdgeSdLanDetail', () => ({
  EdgeSdLanDetail: () => <div data-testid='edge-sdlan-detail-rec'>EdgeSdLanDetail Rec</div>
}))

jest.mock('./EdgeSdLanTable', () => ({
  EdgeSdLanTable: () => <div data-testid='edge-sdlan-table-rec'>EdgeSdLanTable Rec</div>
}))

jest.mock('./EditEdgeSdLan', () => ({
  EditEdgeSdLan: () => <div data-testid='edit-edge-sdlan-rec'>EditEdgeSdLan Rec</div>
}))

jest.mock('./Msp/AddEdgeSdLan', () => ({
  AddEdgeSdLan: () => <div data-testid='add-edge-sdlan-msp'>AddEdgeSdLan MSP</div>
}))

jest.mock('./Msp/EdgeSdLanDetail', () => ({
  EdgeSdLanDetail: () => <div data-testid='edge-sdlan-detail-msp'>EdgeSdLanDetail MSP</div>
}))

jest.mock('./Msp/EdgeSdLanTable', () => ({
  EdgeSdLanTable: () => <div data-testid='edge-sdlan-table-msp'>EdgeSdLanTable MSP</div>
}))

jest.mock('./Msp/EditEdgeSdLan', () => ({
  EditEdgeSdLan: () => <div data-testid='edit-edge-sdlan-msp'>EditEdgeSdLan MSP</div>
}))

// Mock useUserProfileContext
const mockUseUserProfileContext = jest.fn()
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => mockUseUserProfileContext()
}))

// Mock useIsEdgeFeatureReady
const mockUseIsEdgeFeatureReady = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (featureFlag: Features) => mockUseIsEdgeFeatureReady(featureFlag)
}))

describe('EdgeSdLan L2oGRE Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUserProfileContext.mockReturnValue({ isMspUser: false })
    mockUseIsEdgeFeatureReady.mockReturnValue(false)
  })

  describe('AddEdgeSdLan', () => {
    it('should render MSP version when user is MSP and edge delegation is ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <AddEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('add-edge-sdlan-msp')).toBeInTheDocument()
      expect(screen.queryByTestId('add-edge-sdlan-rec')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when user is not MSP', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: false })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <AddEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('add-edge-sdlan-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('add-edge-sdlan-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when edge delegation is not ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(false)

      render(
        <Provider>
          <AddEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('add-edge-sdlan-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('add-edge-sdlan-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })
  })

  describe('EdgeSdLanDetail', () => {
    it('should render MSP version when user is MSP and edge delegation is ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EdgeSdLanDetail />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-detail-msp')).toBeInTheDocument()
      expect(screen.queryByTestId('edge-sdlan-detail-rec')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when user is not MSP', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: false })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EdgeSdLanDetail />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-detail-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('edge-sdlan-detail-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when edge delegation is not ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(false)

      render(
        <Provider>
          <EdgeSdLanDetail />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-detail-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('edge-sdlan-detail-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })
  })

  describe('EdgeSdLanTable', () => {
    it('should render MSP version when user is MSP and edge delegation is ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EdgeSdLanTable />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-table-msp')).toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when user is not MSP', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: false })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EdgeSdLanTable />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-table-rec')).toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when edge delegation is not ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(false)

      render(
        <Provider>
          <EdgeSdLanTable />
        </Provider>
      )

      expect(screen.getByTestId('edge-sdlan-table-rec')).toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })
  })

  describe('EditEdgeSdLan', () => {
    it('should render MSP version when user is MSP and edge delegation is ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EditEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('edit-edge-sdlan-msp')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-edge-sdlan-rec')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when user is not MSP', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: false })
      mockUseIsEdgeFeatureReady.mockReturnValue(true)

      render(
        <Provider>
          <EditEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('edit-edge-sdlan-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-edge-sdlan-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })

    it('should render regular version when edge delegation is not ready', () => {
      mockUseUserProfileContext.mockReturnValue({ isMspUser: true })
      mockUseIsEdgeFeatureReady.mockReturnValue(false)

      render(
        <Provider>
          <EditEdgeSdLan />
        </Provider>
      )

      expect(screen.getByTestId('edit-edge-sdlan-rec')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-edge-sdlan-msp')).not.toBeInTheDocument()
      expect(mockUseIsEdgeFeatureReady).toHaveBeenCalledWith(Features.EDGE_DELEGATION_TOGGLE)
    })
  })
})