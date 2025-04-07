import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { render, screen }        from '@acx-ui/test-utils'

import { AddEdgeSdLan, EdgeSdLanDetail, EdgeSdLanTable, EditEdgeSdLan } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
jest.mock('./L2oGRE/AddEdgeSdLan', () => ({
  AddEdgeSdLan: () => <div data-testid='l2ogre-AddEdgeSdLan' />
}))
jest.mock('./L2oGRE/EdgeSdLanDetail', () => ({
  EdgeSdLanDetail: () => <div data-testid='l2ogre-EdgeSdLanDetail' />
}))
jest.mock('./L2oGRE/EdgeSdLanTable', () => ({
  EdgeSdLanTable: () => <div data-testid='l2ogre-EdgeSdLanTable' />
}))
jest.mock('./L2oGRE/EditEdgeSdLan', () => ({
  EditEdgeSdLan: () => <div data-testid='l2ogre-EditEdgeSdLan' />
}))
jest.mock('./MultiVenue/AddEdgeSdLan', () => ({
  AddEdgeSdLan: () => <div data-testid='mv-AddEdgeSdLan' />
}))
jest.mock('./MultiVenue/EdgeSdLanDetail', () => ({
  EdgeSdLanDetail: () => <div data-testid='mv-EdgeSdLanDetail' />
}))
jest.mock('./MultiVenue/EdgeSdLanTable', () => ({
  EdgeSdLanTable: () => <div data-testid='mv-EdgeSdLanTable' />
}))
jest.mock('./MultiVenue/EditEdgeSdLan', () => ({
  EditEdgeSdLan: () => <div data-testid='mv-EditEdgeSdLan' />
}))

describe('Edge SD-LAN', () => {
  describe('Multi Venue', () => {
    it('should render AddEdgeSdLan successfully', () => {
      render(<AddEdgeSdLan />)
      expect(screen.getByTestId('mv-AddEdgeSdLan')).toBeVisible()
    })

    it('should render EdgeSdLanDetail successfully', () => {
      render(<EdgeSdLanDetail />)
      expect(screen.getByTestId('mv-EdgeSdLanDetail')).toBeVisible()
    })

    it('should render EdgeSdLanTable successfully', () => {
      render(<EdgeSdLanTable />)
      expect(screen.getByTestId('mv-EdgeSdLanTable')).toBeVisible()
    })

    it('should render EditEdgeSdLan successfully', () => {
      render(<EditEdgeSdLan />)
      expect(screen.getByTestId('mv-EditEdgeSdLan')).toBeVisible()
    })
  })

  describe('L2oGRE', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff =>
        ff === Features.EDGE_L2OGRE_TOGGLE)
    })

    it('should render AddEdgeSdLan successfully', () => {
      render(<AddEdgeSdLan />)
      expect(screen.getByTestId('l2ogre-AddEdgeSdLan')).toBeVisible()
    })

    it('should render EdgeSdLanDetail successfully', () => {
      render(<EdgeSdLanDetail />)
      expect(screen.getByTestId('l2ogre-EdgeSdLanDetail')).toBeVisible()
    })

    it('should render EdgeSdLanTable successfully', () => {
      render(<EdgeSdLanTable />)
      expect(screen.getByTestId('l2ogre-EdgeSdLanTable')).toBeVisible()
    })

    it('should render EditEdgeSdLan successfully', () => {
      render(<EditEdgeSdLan />)
      expect(screen.getByTestId('l2ogre-EditEdgeSdLan')).toBeVisible()
    })
  })
})