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
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('{"sla-p1-incidents-count":"10","sla-guest-experience":"20","sla-brand-ssid-compliance":"30","brand-ssid-compliance-matcher":"/a/"}')).toHaveLength(1)
    expect(await screen.findAllByText('table')).toHaveLength(1)
  })
})
