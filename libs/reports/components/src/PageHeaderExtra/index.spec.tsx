import '@testing-library/jest-dom'

import * as config        from '@acx-ui/config'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ReportType } from '../mapping/reportsMapping'

import { usePageHeaderExtra } from '.'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='NetworkFilter' />,
  SANetworkFilter: () => <div data-testid='SANetworkFilter' />
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid='RangePicker' />
}))

describe('pageHeaderExtra component', () => {
  describe('ALTO', () => {
    it('should render correctly for ALTO', async () => {
      const Component = () => <div>{usePageHeaderExtra(ReportType.ACCESS_POINT)}</div>
      render(<Component />, { wrapper: Provider, route: {} })
      expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
      expect(await screen.findByTestId('RangePicker')).toBeVisible()
    })
    it('should pass 1 month as max range', async () => {
      const Component = () => <div>{usePageHeaderExtra(ReportType.ACCESS_POINT)}</div>
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(<Component />, { wrapper: Provider, route: {} })
      expect(await screen.findByTestId('RangePicker')).toBeVisible()
    })

    it('should render correctly for RA', async () => {
      get.mockReturnValue('true')
      const Component = () => <div>{usePageHeaderExtra(ReportType.WIRELESS)}</div>
      render(<Component />, { wrapper: Provider, route: {} })
      expect(await screen.findByTestId('SANetworkFilter')).toBeVisible()
      expect(await screen.findByTestId('RangePicker')).toBeVisible()
    })
  })
})
