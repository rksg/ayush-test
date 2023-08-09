import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { sampleChartBoundary, sampleData } from './__tests__/fixtures'
import * as helper                         from './helper'

import { ConfigChangeChart } from '.'

jest.mock('./helper', () => ({
  ...jest.requireActual('./helper'),
  useDataZoom: jest.fn()
}))

describe('ConfigChangeChart',() => {
  describe('ConfigChangeChart',() => {
    it('should render canvas', () => {
      (helper.useDataZoom as unknown as jest.Mock<ReturnType<typeof helper.useDataZoom>>)
        .mockReturnValue({ canResetZoom: false, resetZoomCallback: jest.fn() })
      const { asFragment } = render(<ConfigChangeChart
        style={{ width: 1000 }}
        data={sampleData}
        chartBoundary={sampleChartBoundary}
        onDotClick={jest.fn()}
      />, { wrapper: Provider, route: {} })
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('canvas')).not.toBeNull()
      expect(screen.queryByRole('button', { name: 'Reset Zoom' })).toBeNull()
    })
    it('should render with zoom enabled', () => {
      (helper.useDataZoom as unknown as jest.Mock<ReturnType<typeof helper.useDataZoom>>)
        .mockReturnValue({ canResetZoom: true, resetZoomCallback: jest.fn() })
      render(<ConfigChangeChart
        style={{ width: 1000 }}
        data={sampleData}
        chartBoundary={sampleChartBoundary}
        onDotClick={jest.fn()}
      />, { wrapper: Provider })
      expect(screen.getByRole('button', { name: 'Reset Zoom' })).toBeVisible()
    })
  })
})
