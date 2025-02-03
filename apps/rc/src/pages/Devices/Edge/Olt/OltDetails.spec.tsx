import { MemoryRouter, Route } from 'react-router-dom'

// import { EdgeNokiaOltData }          from '@acx-ui/rc/utils'
import { screen, render, fireEvent } from '@acx-ui/test-utils'

import { EdgeNokiaOltDetails } from './OltDetails'

// const mockOltDetails: EdgeNokiaOltData = {
//   // add mock data for oltDetails
// }

// const mockActiveSubTab = 'performance'

describe('EdgeNokiaOltDetails', () => {
  it('renders correctly with default props', () => {
    render(
      <MemoryRouter>
        <EdgeNokiaOltDetails />
      </MemoryRouter>
    )
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Cages')).toBeInTheDocument()
  })

  it('renders the correct tabs', () => {
    render(
      <MemoryRouter>
        <EdgeNokiaOltDetails />
      </MemoryRouter>
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(2)
    expect(tabs[0].textContent).toBe('Performance')
    expect(tabs[1].textContent).toBe('Cages')
  })

  it('sets the correct active tab when activeSubTab is provided', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/devices/edge/serialNumber/edit/performance' }]}>
        <Route path='/devices/edge/serialNumber/edit/:activeSubTab'>
          <EdgeNokiaOltDetails />
        </Route>
      </MemoryRouter>
    )
    expect(screen.getByText('Performance')).toHaveClass('ant-tabs-tab-active')
  })

  it('calls handleTabChange when a tab is changed', () => {
    const handleTabChange = jest.fn()
    render(
      <MemoryRouter>
        <EdgeNokiaOltDetails handleTabChange={handleTabChange} />
      </MemoryRouter>
    )
    const tabs = screen.getAllByRole('tab')
    fireEvent.click(tabs[1])
    expect(handleTabChange).toHaveBeenCalledTimes(1)
    expect(handleTabChange).toHaveBeenCalledWith('cages')
  })

  it('renders the correct children for each tab', () => {
    render(
      <MemoryRouter>
        <EdgeNokiaOltDetails />
      </MemoryRouter>
    )
    expect(screen.getByText('PerformanceTab')).toBeInTheDocument()
    expect(screen.getByText('CagesTab')).toBeInTheDocument()
  })
})