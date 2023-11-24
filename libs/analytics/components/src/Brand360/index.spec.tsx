import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Brand360 } from '.'

/* eslint-disable max-len */
/*
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
}))
*/
/* eslint-enable */

describe('Brand360', () => {
  it('renders widgets', async () => {
    render(<Provider><Brand360 /></Provider>)
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    expect(await screen.findAllByText('incident')).toHaveLength(1)
    expect(await screen.findAllByText('guest experience')).toHaveLength(1)
    expect(await screen.findAllByText('brand ssid compliance')).toHaveLength(1)
    expect(await screen.findAllByText('sla')).toHaveLength(1)
    expect(await screen.findAllByText('table')).toHaveLength(1)
  })
})
