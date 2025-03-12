import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import AppInsights from '.'

describe('AppInsights dashboard', () => {
  it('renders appInsights static data', async () => {
    render(<AppInsights />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('Microsoft Teams')).toBeVisible()
    expect(await screen.findByText('Zoom')).toBeVisible()
    expect(await screen.findByText('Cisco WebEx')).toBeVisible()
    expect(await screen.findByText('Google Meet')).toBeVisible()
    expect(await screen.findByText('Workplace')).toBeVisible()
  })
})
