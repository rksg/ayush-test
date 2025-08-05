import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { IntentSummary, useIntentAISummaryQuery } from './services'

import { IntentAISummary } from '.'

const mockUseIntentAISummaryQuery = useIntentAISummaryQuery as jest.Mock

jest.mock('./services', () => ({
  useIntentAISummaryQuery: jest.fn()
}))

const mockIntentAISummaryData: IntentSummary = {
  rrm: {
    new: 1,
    active: 0,
    paused: 7,
    verified: 3
  },
  probeflex: {
    new: 2,
    active: 0,
    paused: 3,
    verified: 6
  },
  ops: {
    new: 0,
    active: 0,
    paused: 8,
    verified: 14
  },
  ecoflex: {
    new: 0,
    active: 4,
    paused: 1,
    verified: 1
  }
}

const mockNoIntentAISummaryData: IntentSummary = {
  rrm: {
    new: 0,
    active: 0,
    paused: 0,
    verified: 0
  },
  probeflex: {
    new: 0,
    active: 0,
    paused: 0,
    verified: 0
  },
  ops: {
    new: 0,
    active: 0,
    paused: 0,
    verified: 0
  },
  ecoflex: {
    new: 0,
    active: 0,
    paused: 0,
    verified: 0
  }
}

const mockNullIntentAISummaryData = {
  rrm: null,
  probeflex: null,
  ops: null,
  ecoflex: null
}

describe('IntentAISummaryWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render IntentAI Summary widget correctly', async () => {
    mockUseIntentAISummaryQuery.mockReturnValue({
      loading: false,
      data: mockIntentAISummaryData
    })

    render(<IntentAISummary/>, { wrapper: Provider })

    expect(await screen.findByText('New:')).toBeVisible()
    expect(await screen.findAllByText('3')).toHaveLength(2)
    expect(await screen.findByText('Active:')).toBeVisible()
    expect(await screen.findAllByText('4')).toHaveLength(2)
    expect(await screen.findByText('Paused:')).toBeVisible()
    expect(await screen.findAllByText('19')).toHaveLength(2)
    expect(await screen.findByText('Verified:')).toBeVisible()
    expect(await screen.findAllByText('24')).toHaveLength(1)
  })

  it.each([
    { data: undefined, name: 'undefined' },
    { data: mockNoIntentAISummaryData, name: 'no data' },
    { data: mockNullIntentAISummaryData, name: 'null' }
  ])('should return no data when query response data is $name',
    async (data) => {
      mockUseIntentAISummaryQuery.mockReturnValue(data)

      render(<IntentAISummary/>, { wrapper: Provider })
      expect(await screen.findByText('No data to display')).toBeVisible()
    })
})