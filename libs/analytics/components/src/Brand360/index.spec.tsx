import '@testing-library/jest-dom'

import { rest } from 'msw'

import { Provider, rbacApiURL }                  from '@acx-ui/store'
import { render, screen, mockServer, fireEvent } from '@acx-ui/test-utils'

import { Brand360 } from '.'

/* eslint-disable max-len */
/*
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
}))
*/
/* eslint-enable */

describe('Brand360', () => {
  beforeEach(() => {
    // store.dispatch(rbacApi.util.resetApiState())
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        // eslint-disable-next-line max-len
        '[{"key": "sla-p1-incidents-count", "value": "1"},{"key": "sla-guest-experience", "value": "2"},{"key": "sla-brand-ssid-compliance", "value": "3"}]'
      )))
    )
  })
  it('renders widgets', async () => {
    render(<Provider><Brand360 /></Provider>)
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    expect(await screen.findAllByText('incident')).toHaveLength(1)
    expect(await screen.findAllByText('guest experience')).toHaveLength(1)
    expect(await screen.findAllByText('brand ssid compliance')).toHaveLength(1)
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('property {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findAllByText('table')).toHaveLength(1)
  })
  it('changes sliceType', async () => {
    render(<Provider><Brand360 /></Provider>)
    fireEvent.click(await screen.findByTestId('CaretDownSolid'))
    fireEvent.click(await screen.findByText('LSP'))
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('lsp {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findAllByText('table')).toHaveLength(1)
  })
  it('applies SLAs', async () => {
    const update = new Promise(resolve => mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, ({ body }, res) => {
        resolve(body)
        return res()
      })
    ))
    render(<Provider><Brand360 /></Provider>)
    const sliders = await screen.findAllByRole('slider')
    fireEvent.mouseDown(sliders[0])
    fireEvent.mouseMove(sliders[0], { clientX: 10 })
    fireEvent.mouseUp(sliders[0])
    fireEvent.click(await screen.findByText('Apply'))
    expect(await update).toEqual({
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
      'sla-brand-ssid-compliance': '3',
      'sla-guest-experience': '2',
      'sla-p1-incidents-count': '100'
    })
  })
  it('resets SLAs', async () => {
    const update = new Promise(resolve => mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, ({ body }, res) => {
        resolve(body)
        return res()
      })
    ))
    render(<Provider><Brand360 /></Provider>)
    const sliders = await screen.findAllByRole('slider')
    fireEvent.mouseDown(sliders[0])
    fireEvent.mouseMove(sliders[0], { clientX: 10 })
    fireEvent.mouseUp(sliders[0])
    fireEvent.click(await screen.findByText('Reset'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(await update).toEqual({
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
      'sla-brand-ssid-compliance': '3',
      'sla-guest-experience': '2',
      'sla-p1-incidents-count': '1'
    })
  })
})
