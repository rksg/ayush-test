import { AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import { render, screen }          from '@acx-ui/test-utils'

import { NetworkHistoryWidget } from '.'

jest.mock('../NetworkHistory', () => ({
  NetworkHistory: (props: { hideLegends: boolean, filters: AnalyticsFilter }) =>
    <div data-testid={'NetworkHistory'}>
      {`hideLegends: ${Boolean(props.hideLegends).toString()}`}
      {`filters: ${Boolean(props.filters)}`}
    </div>
}))

describe('NetworkHistoryWidget', () => {
  it('should render correctly', async () => {
    render(<Provider><Router><NetworkHistoryWidget /></Router></Provider>)
    expect(await screen.findByTestId('NetworkHistory')).toBeVisible()
    expect(await screen.findByText(/hideLegends: true/)).toBeVisible()
    expect(await screen.findByText(/filters: true/)).toBeVisible()
  })
})