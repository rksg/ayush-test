import userEvent                       from '@testing-library/user-event'
import { rest }                        from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { EdgeNokiaOltData, EdgeTnmServiceUrls }                  from '@acx-ui/rc/utils'
import { EdgeOltFixtures }                                       from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { screen, render, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EdgeNokiaOltDetails } from './OltDetails'

const { mockOlt, mockOfflineOlt, mockOltCageList } = EdgeOltFixtures
jest.mock('@acx-ui/edge/components', () => ({
  EdgeNokiaOltDetailsPageHeader: (props: { currentOlt: EdgeNokiaOltData }) =>
    <div data-testid='EdgeNokiaOltDetailsPageHeader'>
      {JSON.stringify(props.currentOlt)}
    </div>,
  EdgeNokiaCageTable: () => <div data-testid='EdgeNokiaCageTable' />,
  EdgeOltTrafficByVolumeWidget: () => <div data-testid='EdgeOltTrafficByVolumeWidget' />,
  EdgeOltResourceUtilizationWidget: () => <div data-testid='EdgeOltResourceUtilizationWidget' />
}))

describe('EdgeNokiaOltDetails', () => {
  const mockGetCagesReq = jest.fn()

  beforeEach(() => {
    mockGetCagesReq.mockReset()

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeCageList.url,
        (_, res, ctx) => {
          mockGetCagesReq()
          return res(ctx.json(mockOltCageList))
        })
    )
  })


  it('renders the correct tabs with oltDetail is undefined', async () => {
    render(<Provider><MemoryRouter>
      <EdgeNokiaOltDetails />
    </MemoryRouter></Provider>)
    expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)
    expect(tabs[0].textContent).toBe('Performance')
    expect(tabs[1].textContent).toBe('Cages')
    expect(tabs[2].textContent).toBe('Uplink')

    screen.getByRole('tab', { name: 'Performance' })
    expect(await screen.findAllByText('No data to display')).toHaveLength(2)

    await userEvent.click(screen.getByRole('tab', { name: 'Cages' }))
    expect(screen.getByTestId('EdgeNokiaCageTable')).toBeInTheDocument()
    expect(screen.queryAllByRole('row', { name: /S.* (UP|DOWN)/ })).toHaveLength(0)
    expect(mockGetCagesReq).not.toBeCalled()
  })

  it('should not trigger getCages API when OLT is offline', async () => {
    render(<Provider><MemoryRouter initialEntries={[{
      pathname: '/devices/edge/serialNumber/edit/performance',
      state: mockOfflineOlt }]}
    >
      <EdgeNokiaOltDetails />
    </MemoryRouter></Provider>)

    expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    screen.getByRole('tab', { name: 'Performance' })
    expect(await screen.findAllByText('No data to display')).toHaveLength(2)

    await userEvent.click(screen.getByRole('tab', { name: 'Cages' }))
    expect(screen.getByTestId('EdgeNokiaCageTable')).toBeInTheDocument()
    expect(screen.queryAllByRole('row', { name: /S.* (UP|DOWN)/ })).toHaveLength(0)
    expect(mockGetCagesReq).not.toBeCalled()
  })

  it('sets the correct active tab when activeSubTab is provided', async () => {
    render(<Provider><MemoryRouter initialEntries={[{
      pathname: '/devices/optical/olt-Id/details/performance',
      state: mockOlt }]}
    >
      <Routes>
        <Route
          path='/devices/optical/:oltId/details/:activeSubTab'
          element={<EdgeNokiaOltDetails />}
        />
      </Routes>
    </MemoryRouter></Provider>)

    // eslint-disable-next-line max-len
    expect(screen.getByRole('tab', { name: 'Performance' })).toHaveAttribute('aria-selected', 'true')
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    screen.getByTestId('EdgeOltTrafficByVolumeWidget')
  })

  it('renders the correct children for each tab', async () => {
    render(<Provider><MemoryRouter initialEntries={[{
      pathname: '/devices/edge/serialNumber/edit/performance',
      state: mockOlt }]}
    >
      <EdgeNokiaOltDetails />
    </MemoryRouter></Provider>)

    screen.getByRole('tab', { name: 'Performance' })
    await userEvent.click(screen.getByRole('tab', { name: 'Cages' }))
    expect(screen.getByTestId('EdgeNokiaCageTable')).toBeInTheDocument()
  })
})