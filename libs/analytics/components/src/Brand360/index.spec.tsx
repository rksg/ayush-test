import '@testing-library/jest-dom'

import { rest } from 'msw'

import { Provider, rbacApiURL }       from '@acx-ui/store'
import { render, screen, mockServer } from '@acx-ui/test-utils'

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
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        '[{"key": "sla-p1-incidents-count", "value": "12"}]'
      )))
    )
    render(<Provider><Brand360 /></Provider>)
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    expect(await screen.findAllByText('incident')).toHaveLength(1)
    expect(await screen.findAllByText('guest experience')).toHaveLength(1)
    expect(await screen.findAllByText('brand ssid compliance')).toHaveLength(1)
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('{"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"12","sla-guest-experience":"100","sla-brand-ssid-compliance":"100"}')).toHaveLength(1)
    expect(await screen.findAllByText('table')).toHaveLength(1)
  })
})
