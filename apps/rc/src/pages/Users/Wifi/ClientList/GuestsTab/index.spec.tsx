import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'
import { DateRange }      from '@acx-ui/utils'

import { GuestTabContext } from './GuestsTable/context'

import { GuestsTab } from '.'

jest.mock('./GuestsTable', () => ({
  GuestsTable: () => <div data-testid={'rc-GuestsTable'} title='GuestsTable' />
}))

describe('AP Guest Tab', () => {
  const mockDateFilter = {
    range: DateRange.allTime,
    setRange: () => { },
    startDate: '',
    setStartDate: () => { },
    endDate: '',
    setEndDate: () => { }
  }

  it('should render correctly', async () => {
    const setGuestCount = jest.fn()
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    render(<Provider>
      <GuestTabContext.Provider value={{ setGuestCount }}>
        <GuestsTab dateFilter={mockDateFilter} />
      </GuestTabContext.Provider>
    </Provider>, { route: { params } })
    expect(screen.queryByTestId('rc-GuestsTable')).toBeVisible()
  })

})
