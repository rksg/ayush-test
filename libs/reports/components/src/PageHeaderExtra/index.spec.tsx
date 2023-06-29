import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ReportType } from '../mapping/reportsMapping'

import { usePageHeaderExtra } from '.'


jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid='RangePicker' />
}))

describe('pageHeaderExtra component', () => {
  it('should render correctly', async () => {
    const Component = () => <div>{usePageHeaderExtra(ReportType.ACCESS_POINT)}</div>
    render(<Component />, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('RangePicker')).toBeVisible()
  })
})
