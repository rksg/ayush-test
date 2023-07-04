import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'
import { NetworkPath, DateRange }                from '@acx-ui/utils'

import { VenueFilter } from '.'

const setNodeFilter = jest.fn()
const filters = (nodes: NetworkPath[]) => ({
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: { networkNodes: nodes, switchNodes: nodes }
})
let mockUseDashboardFilter = { venueIds: [], filters: filters([]), setNodeFilter }
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDashboardFilter: () => mockUseDashboardFilter
}))
describe('venue Filter', () => {
  const route = {
    params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' },
    path: '/:tenantId/venues'
  }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: [
          { name: 'venue A', id: 'venue1' },
          { name: 'venue B', id: 'venue2' }
        ] }))
      )
    )
    jest.clearAllMocks()
    mockUseDashboardFilter = { venueIds: [], filters: filters([]), setNodeFilter }
  })
  it('should render loader', () => {
    render(<Provider><VenueFilter /></Provider>, { route })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render venue filter', async () => {
    const { asFragment } = render(<Provider><VenueFilter /></Provider>, { route })
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[class="ant-select-selector"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    render(<Provider><VenueFilter /></Provider>, { route })
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNodeFilter).toHaveBeenCalledTimes(1)
    expect(setNodeFilter).toHaveBeenCalledWith([['venue1']])
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should select multiple network node', async () => {
    render(<Provider><VenueFilter /></Provider>, { route })
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('venue B'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNodeFilter).toHaveBeenCalledTimes(1)
    expect(setNodeFilter).toHaveBeenCalledWith([['venue1'], ['venue2']])
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should search node', async () => {
    render(<Provider><VenueFilter /></Provider>, { route })
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.type(screen.getByRole('combobox'), 'venue B')
    const ele = await screen.findAllByText('venue B')
    fireEvent.click(ele[1])
    fireEvent.click(await screen.findByText('Apply'))
    expect(setNodeFilter).toHaveBeenCalledTimes(1)
    expect(setNodeFilter).toHaveBeenCalledWith([['venue2']])
  })
  it('renders existing filters', async () => {
    mockUseDashboardFilter = {
      filters: filters([[{ type: 'zone', name: 'venue1' }]]),
      venueIds: ['venue1'],
      setNodeFilter
    }
    render(<Provider><VenueFilter /></Provider>, { route })
    await screen.findByText('0 venues selected')
  })
})
