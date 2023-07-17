import userEvent from '@testing-library/user-event'

import { Provider, recommendationUrl }                  from '@acx-ui/store'
import { mockGraphqlMutation, render, screen, cleanup } from '@acx-ui/test-utils'
import { DateRange }                                    from '@acx-ui/utils'

import { apiResult } from '../__tests__/fixtures'

import { RecommendationActions } from '.'

const mockedCrrm = {
  ...apiResult.recommendations[0],
  scope: 'test-scope',
  type: 'venue',
  priority: 'high',
  priorityLabel: 'High',
  category: 'AI-Drive Cloud RRM',
  summary: '',
  status: 'New',
  statusTooltip: 'new',
  statusEnum: 'new' as 'new',
  mutedBy: '',
  mutedAt: '',
  path: [] as []
}

const filters = {
  range: DateRange.last24Hours,
  startDate: '07-14-2023',
  endDate: '07-15-2023',
  filter: {}
}

describe('RecommendationActions', () => {
  it('should render active status icons correctly', async () => {
    const testCases = [
      { statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'ChevronLeftCircleOutlined'] },
      { statusEnum: 'applyscheduled' as 'applyscheduled', icons: [
        'CalendarOutlined', 'CancelCircleOutlined', 'ChevronLeftCircleOutlined'] },
      { statusEnum: 'applied' as 'applied', icons: [
        'CheckMarkCircleOutline', 'ChevronLeftCircleOutlined'] },
      { statusEnum: 'revertscheduled' as 'revertscheduled', icons: [
        'CheckMarkCircleOutline', 'CancelCircleOutlined' ,'CalendarOutlined'] },
      { statusEnum: 'applyfailed' as 'applyfailed',
        icons: ['CheckMarkCircleOutline', 'ChevronLeftCircleOutlined'] }
    ].map(async ({ statusEnum, icons }) => {
      render(<RecommendationActions
        recommendation={{ ...mockedCrrm, statusEnum }}
        filters={filters} />,
      { wrapper: Provider })
      icons.forEach((icon) => {
        const checkMark = screen.getByTestId(icon)
        expect(checkMark).toBeVisible()
      })
      cleanup()
    })
    await Promise.all(testCases)
  })
  it('should render muted action correctly', async () => {
    render(<RecommendationActions
      recommendation={{ ...mockedCrrm, isMuted: true }}
      filters={filters} />,
    { wrapper: Provider })
    expect(screen.getByTestId('CheckMarkCircleOutline')).toBeVisible()
    expect(screen.getByTestId('ChevronLeftCircleOutlined')).toBeVisible()
  })
  it('should render delete status icon correctly', async () => {
    render(<RecommendationActions
      recommendation={{ ...mockedCrrm, statusEnum: 'deleted' }}
      filters={filters} />,
    { wrapper: Provider })
    expect(screen.queryByTestId('CalendarOutlined')).toBeNull()
    expect(screen.queryByTestId('CancelCircleOutlined')).toBeNull()
    expect(screen.queryByTestId('CancelCircleSolid')).toBeNull()
    expect(screen.queryByTestId('CheckMarkCircleOutline')).toBeNull()
    expect(screen.queryByTestId('ChevronLeftCircleOutlined')).toBeNull()
  })
  it('should handle apply mutation correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
    render(<RecommendationActions
      recommendation={mockedCrrm}
      filters={filters} />,
    { wrapper: Provider })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('CheckMarkCircleOutline'))
    await user.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(await screen.findByRole('button', { name: 'Jul' })).not.toHaveFocus()
  })
  it('should handle cancel mutation correctly', async () => {
    const resp = { cancel: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
    render(<RecommendationActions
      recommendation={{ ...mockedCrrm, statusEnum: 'applyscheduled' }}
      filters={filters} />,
    { wrapper: Provider })
    const user = userEvent.setup()
    await user.click(screen.getByTestId('CancelCircleOutlined'))
    expect(await screen.findAllByPlaceholderText('Select date')).toHaveLength(2)
  })
})