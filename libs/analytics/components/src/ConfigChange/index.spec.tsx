import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConfigChange } from '.'

describe('ConfigChange', () => {
  it('should render page correctly', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('chart')).toBeVisible()
    expect(await screen.findByText('kpi')).toBeVisible()
    expect(await screen.findByText('table')).toBeVisible()
  })
})