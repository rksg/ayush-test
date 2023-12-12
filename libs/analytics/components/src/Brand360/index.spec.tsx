import '@testing-library/jest-dom'

import { rest } from 'msw'

import type { Settings }                         from '@acx-ui/analytics/utils'
import { Provider, rbacApiURL }                  from '@acx-ui/store'
import { render, screen, mockServer, fireEvent } from '@acx-ui/test-utils'

import { Brand360 } from '.'


jest.mock('./Table', () => ({
  BrandTable: ({ sliceType, slaThreshold }: { sliceType: string, slaThreshold: Settings }) =>
    <div data-testid={'brand360Table'}>
      {sliceType} {JSON.stringify(slaThreshold)}
    </div>
}))


jest.mock('./SlaTile', () => ({
  SlaTile: ({
    chartKey,
    sliceType,
    ssidRegex,
    start,
    end
  }
  :{
    chartKey: string,
    sliceType: string,
    ssidRegex: string,
    start: string,
    end: string
  }) =>
    <div data-testid={'brand360Tile'}>
      {JSON.stringify({ chartKey, sliceType, ssidRegex, start, end })}
    </div>
}))


describe('Brand360', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text(
        // eslint-disable-next-line max-len
        '[{"key": "sla-p1-incidents-count", "value": "1"},{"key": "sla-guest-experience", "value": "2"},{"key": "sla-brand-ssid-compliance", "value": "3"}]'
      )))
    )
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2023-12-12T00:00:00+00:00')))
  })
  afterEach(() => jest.useRealTimers())
  it('renders widgets', async () => {
    render(<Provider><Brand360 /></Provider>)
    expect(await screen.findAllByDisplayValue('Last 8 Hours')).toHaveLength(2)
    const tiles = await screen.findAllByTestId('brand360Tile')
    expect(tiles).toHaveLength(3)
    tiles.forEach(tile => expect(tile).toBeVisible())
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('property {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
  })
  it('changes sliceType', async () => {
    render(<Provider><Brand360 /></Provider>)
    fireEvent.click(await screen.findByTestId('CaretDownSolid'))
    fireEvent.click(await screen.findByText('LSP'))
    // eslint-disable-next-line max-len
    expect(await screen.findAllByText('lsp {"brand-ssid-compliance-matcher":"^[a-zA-Z0-9]{5}_GUEST$","sla-p1-incidents-count":"1","sla-guest-experience":"2","sla-brand-ssid-compliance":"3"}')).toHaveLength(1)
    expect(await screen.findByTestId('brand360Table')).toBeVisible()
    const tiles = await screen.findAllByTestId('brand360Tile')
    const tile = tiles[0]
    expect(tile.textContent?.includes('lsp')).toBeTruthy()
    expect(tile.textContent?.includes('start')).toBeTruthy()
    expect(tile.textContent?.includes('end')).toBeTruthy()
    expect(tile.textContent?.includes('^[a-zA-Z0-9]{5}_GUEST$')).toBeTruthy()
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
    const { asFragment } = render(<Provider><Brand360 /></Provider>)
    const sliders = await screen.findAllByRole('slider')
    fireEvent.mouseDown(sliders[0])
    fireEvent.mouseMove(sliders[0], { clientX: 10 })
    fireEvent.mouseUp(sliders[0])
    fireEvent.click(await screen.findByText('Reset'))
    expect(asFragment()).toMatchSnapshot()
  })
})
