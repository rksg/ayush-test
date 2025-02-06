import userEvent                       from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { EdgeNokiaOltData } from '@acx-ui/rc/utils'
import { EdgeOltFixtures }  from '@acx-ui/rc/utils'
import { screen, render }   from '@acx-ui/test-utils'

import { EdgeNokiaOltDetails } from './OltDetails'

const { mockOlt } = EdgeOltFixtures
jest.mock('@acx-ui/edge/components', () => ({
  EdgeNokiaOltDetailsPageHeader: (props: { currentOlt: EdgeNokiaOltData }) =>
    <div data-testid='EdgeNokiaOltDetailsPageHeader'>
      {JSON.stringify(props.currentOlt)}
    </div>,
  EdgeNokiaCageTable: () => <div data-testid='EdgeNokiaCageTable' />
}))
describe('EdgeNokiaOltDetails', () => {

  it('renders the correct tabs', () => {
    render(<MemoryRouter>
      <EdgeNokiaOltDetails />
    </MemoryRouter>
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(2)
    expect(tabs[0].textContent).toBe('Performance')
    expect(tabs[1].textContent).toBe('Cages')
  })

  it('sets the correct active tab when activeSubTab is provided', () => {
    render(<MemoryRouter initialEntries={[{
      pathname: '/devices/optical/olt-Id/details/performance',
      state: mockOlt }]}
    >
      <Routes>
        <Route
          path='/devices/optical/:oltId/details/:activeSubTab'
          element={<EdgeNokiaOltDetails />}
        />
      </Routes>
    </MemoryRouter>)

    // eslint-disable-next-line max-len
    expect(screen.getByRole('tab', { name: 'Performance' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders the correct children for each tab', async () => {
    render(<MemoryRouter initialEntries={[{
      pathname: '/devices/edge/serialNumber/edit/performance',
      state: mockOlt }]}
    >
      <EdgeNokiaOltDetails />
    </MemoryRouter>
    )
    expect(screen.getByText('PerformanceTab')).toBeInTheDocument()
    await userEvent.click( screen.getByRole('tab', { name: 'Cages' }))
    expect(screen.getByTestId('EdgeNokiaCageTable')).toBeInTheDocument()
  })
})