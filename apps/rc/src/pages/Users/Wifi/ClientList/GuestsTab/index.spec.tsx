import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'
import { DateRange }          from '@acx-ui/utils'

import { GuestClient } from '../../__tests__/fixtures'

import { GuestsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AP Guest Tab', () => {
  let params: { tenantId: string }
  const mockDateFilter = {
    range: DateRange.allTime,
    setRange: () => { },
    startDate: '',
    setStartDate: () => { },
    endDate: '',
    setEndDate: () => { }
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <GuestsTab dateFilter={mockDateFilter} />
    </Provider>, { route: { params } })
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    expect(asFragment()).toMatchSnapshot()
    jest.useRealTimers()
  })

})
