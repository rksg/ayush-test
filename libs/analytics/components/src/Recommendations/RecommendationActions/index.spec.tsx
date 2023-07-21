import userEvent from '@testing-library/user-event'

import { Provider, recommendationUrl }                  from '@acx-ui/store'
import { mockGraphqlMutation, render, screen, cleanup } from '@acx-ui/test-utils'

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

jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  return {
    __esModule: true,
    ...moment,
    default: () => moment('07-15-2023 14:30', 'MM-DD-YYYY HH:mm')
  }
})

describe('RecommendationActions', () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })
  it('should render active status icons correctly', async () => {
    const testCases = [
      { statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'] },
      { statusEnum: 'applyscheduled' as 'applyscheduled', icons: [
        'CalendarOutlined', 'CancelCircleOutlined', 'Reload'] },
      { statusEnum: 'applied' as 'applied', icons: [
        'CheckMarkCircleOutline', 'Reload'] },
      { statusEnum: 'revertscheduled' as 'revertscheduled', icons: [
        'CheckMarkCircleOutline', 'CancelCircleOutlined' ,'CalendarOutlined'] },
      { statusEnum: 'applyfailed' as 'applyfailed',
        icons: ['CheckMarkCircleOutline', 'Reload'] }
    ].map(async ({ statusEnum, icons }) => {
      render(
        <RecommendationActions recommendation={{ ...mockedCrrm, statusEnum }} />,
        { wrapper: Provider }
      )
      icons.forEach((icon) => {
        const checkMark = screen.getByTestId(icon)
        expect(checkMark).toBeVisible()
      })
      cleanup()
    })
    await Promise.all(testCases)
  })
  it('should render muted action correctly', async () => {
    render(
      <RecommendationActions recommendation={{ ...mockedCrrm, isMuted: true }} />,
      { wrapper: Provider }
    )
    expect(screen.getByTestId('CheckMarkCircleOutline')).toBeVisible()
    expect(screen.getByTestId('Reload')).toBeVisible()
  })
  it('should render delete status icon correctly', async () => {
    render(
      <RecommendationActions recommendation={{ ...mockedCrrm, statusEnum: 'deleted' }} />,
      { wrapper: Provider }
    )
    expect(screen.queryByTestId('CalendarOutlined')).toBeNull()
    expect(screen.queryByTestId('CancelCircleOutlined')).toBeNull()
    expect(screen.queryByTestId('CancelCircleSolid')).toBeNull()
    expect(screen.queryByTestId('CheckMarkCircleOutline')).toBeNull()
    expect(screen.queryByTestId('Reload')).toBeNull()
  })
  it('should handle same day apply mutation correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={mockedCrrm} />,
      { wrapper: Provider }
    )
    const user = userEvent.setup()
    const inputs = await screen.findAllByPlaceholderText('Select date')
    expect(inputs[0]).toHaveValue('2023-07-15')
    await user.click(await screen.findByTestId('CheckMarkCircleOutline'))
    await user.click(inputs[0])
    await user.click((await screen.findAllByRole('time-picker-minutes'))[0])
    await screen.findByText('45')
    await user.click((await screen.findAllByRole('time-picker-hours'))[0])
    const checkHour = await screen.findAllByText('00')
    await user.click(checkHour[0])
    await user.click(await screen.findByText('Apply'))
    expect(inputs[0]).toHaveValue('2023-07-15')
  })
  it('should handle non-same day apply mutation correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={mockedCrrm} />,
      { wrapper: Provider }
    )
    const user = userEvent.setup()
    const inputs = await screen.findAllByPlaceholderText('Select date')
    expect(inputs[0]).toHaveValue('2023-07-15')
    await user.click(await screen.findByTestId('CheckMarkCircleOutline'))
    await user.click(await screen.findByTitle('2023-07-16'))
    await user.click((await screen.findAllByRole('time-picker-minutes'))[0])
    await screen.findByText('45')
    await user.click((await screen.findAllByRole('time-picker-hours'))[0])
    const checkHour = await screen.findAllByText('00')
    await user.click(checkHour[0])
    await user.click(await screen.findByText('Apply'))
    expect(inputs[0]).toHaveValue('2023-07-16')
  })
  it('should handle cancel mutation correctly', async () => {
    const resp = { cancel: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={{ ...mockedCrrm, statusEnum: 'applyscheduled' }} />,
      { wrapper: Provider }
    )
    const user = userEvent.setup()
    await user.click(screen.getByTestId('CancelCircleOutlined'))
    expect(await screen.findAllByPlaceholderText('Select date')).toHaveLength(2)
  })
})