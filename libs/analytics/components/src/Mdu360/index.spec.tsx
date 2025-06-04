
import '@testing-library/jest-dom'
import { useEffect } from 'react'

import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'
import { DateRange, useDateFilter }  from '@acx-ui/utils'


import { VenueFilterProps } from './VenueFilter'

import { Mdu360 } from '.'

const mockNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: jest.fn().mockReturnValue({ activeTab: 'networkOverview' }),
  useNavigate: () => mockNavigate,
  useTenantLink: jest.fn().mockReturnValue({ pathname: '/t1/v/mdu360' })
}))


jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDateFilter: jest.fn().mockReturnValue({
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-31'),
    setDateFilter: jest.fn(),
    range: 'month'
  })
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  getDefaultEarliestStart: jest.fn().mockReturnValue(new Date('2023-01-01')),
  RangePicker: () => <div data-testid={'analytics-RangePicker'} title='RangePicker' />
}))

jest.mock('./VenueFilter', () => ({
  VenueFilter: ({ selectedVenues, setSelectedVenues }: VenueFilterProps) => (
    <div data-testid='venue-filter'>
      <button onClick={() => setSelectedVenues(['venue1'])}>Select Venue</button>
      <span data-testid='selected-venues'>{selectedVenues.length}</span>
    </div>
  )
}))

const route = {
  params: { activeTab: 'networkOverview', tenantId: 't1' },
  path: '/:tenantId/v/mdu360/residentExperience'
}

describe('Mdu360', () => {
  beforeEach(() => {
    // jest.clearAllMocks()
    Date.now = jest.fn(() => new Date('2023-02-21T00:00:00.000Z').getTime())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockNavigate.mockClear()
  })

  const TestWrapper = () => {
    const { setDateFilter } = useDateFilter()
    useEffect(() => {
      setDateFilter({
        range: DateRange.custom,
        startDate: '2023-02-01T00:00:00.000Z',
        endDate: '2023-02-01T00:00:00.000Z'
      })
    }, [])
    return <Provider><Mdu360 /></Provider>
  }

  const renderComponent = () => {
    render(
      <TestWrapper />, {
        route
      })
  }

  it('renders MDU 360 correct', () => {
    renderComponent()
    expect(screen.getByText('MDU 360')).toBeVisible()
    expect(screen.getByTestId('venue-filter')).toBeInTheDocument()
    expect(screen.getByTestId('analytics-RangePicker')).toBeInTheDocument()
  })

  it('renders tabs with correct', async () => {
    renderComponent()
    await screen.findByText('Network Overview')
    await screen.findByText('Resident Experience')
    fireEvent.click(await screen.findByText('Resident Experience'))

    expect(mockNavigate).toBeCalledTimes(1)

    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/t1/v/mdu360/residentExperience' })
  })

})