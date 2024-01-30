import userEvent       from '@testing-library/user-event'
import { MomentInput } from 'moment-timezone'

import { Provider, recommendationUrl }                          from '@acx-ui/store'
import { mockGraphqlMutation, render, screen, cleanup, within } from '@acx-ui/test-utils'

import { recommendationListResult }               from '../__tests__/fixtures'
import { Recommendation, RecommendationListItem } from '../services'

import { RecommendationActions, isCrrmOptimizationMatched } from '.'

const mockedCrrm = {
  ...recommendationListResult.recommendations[0],
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
  path: [] as [],
  statusTrail: [{ status: 'new' }]
}

jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  return {
    __esModule: true,
    ...moment,
    default: (date: MomentInput) => date === '2023-11-17T11:15:00.000Z'
      ? moment(date)
      : moment('07-15-2023 14:15', 'MM-DD-YYYY HH:mm')
  }
})

describe('RecommendationActions', () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })
  it('should render active status icons correctly', async () => {
    const testCases = [
      {
        statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [ { status: 'new' } ]
      },
      {
        statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [ { status: 'new' } ],
        preferences: { crrmFullOptimization: true },
        metadata: { algorithmData: { isCrrmFullOptimization: true } }
      },
      {
        statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [ { status: 'new' } ],
        preferences: { crrmFullOptimization: true },
        metadata: { algorithmData: { isCrrmFullOptimization: false } }
      },
      {
        statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [ { status: 'new' } ],
        preferences: { crrmFullOptimization: false },
        metadata: { algorithmData: { isCrrmFullOptimization: true } }
      },
      {
        statusEnum: 'new' as 'new',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [ { status: 'new' } ],
        preferences: { crrmFullOptimization: false },
        metadata: { algorithmData: { isCrrmFullOptimization: false } }
      },
      {
        statusEnum: 'applyscheduled' as 'applyscheduled',
        icons: ['CalendarOutlined', 'CancelCircleOutlined', 'Reload'],
        statusTrail: [
          { status: 'new' },
          { status: 'applyscheduled' }
        ]
      },
      {
        statusEnum: 'applyscheduled' as 'applyscheduled',
        icons: ['CalendarOutlined', 'Reload'],
        statusTrail: [
          { status: 'new' },
          { status: 'applyscheduled' },
          { status: 'applyscheduleinprogress' },
          { status: 'applied' },
          { status: 'applyscheduled' },
          { status: 'applyscheduleinprogress' },
          { status: 'applied' },
          { status: 'applyscheduled' }
        ]
      },
      {
        statusEnum: 'applied' as 'applied',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [
          { status: 'new' },
          { status: 'applyscheduled' },
          { status: 'applyscheduleinprogress' },
          { status: 'applied' }
        ]
      },
      {
        statusEnum: 'revertscheduled' as 'revertscheduled',
        icons: ['CheckMarkCircleOutline', 'CancelCircleOutlined' ,'CalendarOutlined'],
        statusTrail: [
          { status: 'new' },
          { status: 'applyscheduled' },
          { status: 'applyscheduleinprogress' },
          { status: 'applied' },
          { status: 'revertscheduled' }
        ]
      },
      {
        statusEnum: 'applyfailed' as 'applyfailed',
        icons: ['CheckMarkCircleOutline', 'Reload'],
        statusTrail: [
          { status: 'new' },
          { status: 'applyscheduled' },
          { status: 'applyscheduleinprogress' },
          { status: 'applyfailed' }
        ]
      }
    ].map(async ({ statusEnum, icons }) => {
      render(
        <RecommendationActions recommendation={
          { ...mockedCrrm, statusEnum } as unknown as RecommendationListItem} />,
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
      <RecommendationActions recommendation={
        { ...mockedCrrm, isMuted: true } as unknown as RecommendationListItem} />,
      { wrapper: Provider }
    )
    expect(screen.getByTestId('CheckMarkCircleOutline')).toBeVisible()
    expect(screen.getByTestId('Reload')).toBeVisible()
  })
  it('should render delete status icon correctly', async () => {
    render(
      <RecommendationActions recommendation={
        { ...mockedCrrm, statusEnum: 'deleted' } as unknown as RecommendationListItem} />,
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
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={mockedCrrm as unknown as RecommendationListItem} />,
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
    await user.click((await screen.findAllByText('Apply'))[0])
    expect(inputs[0]).toHaveValue('2023-07-15')
  })
  it('should handle non-same day apply mutation correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={mockedCrrm as unknown as RecommendationListItem} />,
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
    await user.click((await screen.findAllByText('Apply'))[0])
    expect(inputs[0]).toHaveValue('2023-07-16')
  })
  it('shows future date when user can schedule apply or revert', async () => {
    ['new', 'applied', 'applywarning', 'revertfailed'].forEach(async (statusEnum) => {
      const recommendation = { ...mockedCrrm, statusEnum } as unknown as RecommendationListItem
      const div = document.createElement('div')
      const { container } = render(
        <RecommendationActions {...{ recommendation }} />,
        { wrapper: Provider, container: div }
      )
      const inputs = await within(container).findAllByPlaceholderText('Select date')
      const input = inputs.find(input => input.getAttribute('disabled') === null)
      expect(input).toHaveValue('2023-07-15')
    })
  })
  it('shows scheduled at when user can edit schedule', async () => {
    ['applyscheduled', 'revertscheduled'].forEach(async (statusEnum) => {
      const recommendation = {
        ...mockedCrrm,
        statusEnum,
        metadata: { scheduledAt: '2023-11-17T11:15:00.000Z' }
      } as unknown as RecommendationListItem
      const div = document.createElement('div')
      const { container } = render(
        <RecommendationActions {...{ recommendation }} />,
        { wrapper: Provider, container: div }
      )
      const inputs = await within(container).findAllByPlaceholderText('Select date')
      const input = inputs.find(input => input.getAttribute('disabled') === null)
      expect(input).toHaveValue('2023-11-17')
    })
  })
  it('does not allow scheduling', async () => {
    [
      'applyfailed',
      'beforeapplyinterrupted',
      'afterapplyinterrupted',
      'reverted',
      'applyscheduleinprogress',
      'revertscheduleinprogress'
    ].forEach(async (statusEnum) => {
      const recommendation = { ...mockedCrrm, statusEnum } as unknown as RecommendationListItem
      const div = document.createElement('div')
      const { container } = render(
        <RecommendationActions {...{ recommendation }} />,
        { wrapper: Provider, container: div }
      )
      const inputs = await within(container).findAllByPlaceholderText('Select date')
      const input = inputs.find(input => input.getAttribute('disabled') === null)
      expect(input).toBeUndefined()
    })
  })
  it('should handle cancel mutation correctly', async () => {
    const resp = { cancel: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'CancelRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={
        { ...mockedCrrm, statusEnum: 'applyscheduled' } as unknown as RecommendationListItem} />,
      { wrapper: Provider }
    )
    const user = userEvent.setup()
    await user.click(screen.getByTestId('CancelCircleOutlined'))
    expect(await screen.findAllByPlaceholderText('Select date')).toHaveLength(2)
  })
  it('should show toast if scheduled time is before buffer', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })
    render(
      <RecommendationActions recommendation={mockedCrrm as unknown as RecommendationListItem} />,
      { wrapper: Provider }
    )
    const user = userEvent.setup()
    const inputs = await screen.findAllByPlaceholderText('Select date')
    expect(inputs[0]).toHaveValue('2023-07-15')
    await user.click(await screen.findByTestId('CheckMarkCircleOutline'))
    await user.click(await screen.findByTitle('2023-07-16'))
    await user.click(await screen.findByRole('time-picker-minutes'))
    await user.click((await screen.findAllByText('15'))[1])
    await user.click(await screen.findByRole('time-picker-hours'))
    await user.click((await screen.findAllByText('14'))[1])
    await user.click((await screen.findAllByTitle('2023-07-15'))[1])
    await user.click((await screen.findAllByText('Apply'))[0])
    expect(await screen.findByText('Scheduled time cannot be before 07/15/2023 14:15'))
      .toBeVisible()
  })
})

describe('isCrrmOptimizationMatched', () => {
  it('should return correct value', () => {
    expect(isCrrmOptimizationMatched(
      { algorithmData: { isCrrmFullOptimization: true } } as unknown as Recommendation['metadata'],
      { crrmFullOptimization: true } as unknown as Recommendation['preferences']
    )).toBe(true)
    expect(isCrrmOptimizationMatched(
      { algorithmData: { isCrrmFullOptimization: false } } as unknown as Recommendation['metadata'],
      { crrmFullOptimization: false } as unknown as Recommendation['preferences']
    )).toBe(true)
    expect(isCrrmOptimizationMatched(
      { algorithmData: { isCrrmFullOptimization: true } } as unknown as Recommendation['metadata'],
      { crrmFullOptimization: false } as unknown as Recommendation['preferences']
    )).toBe(false)
    expect(isCrrmOptimizationMatched(
      { algorithmData: { isCrrmFullOptimization: false } } as unknown as Recommendation['metadata'],
      { crrmFullOptimization: true } as unknown as Recommendation['preferences']
    )).toBe(false)
    expect(isCrrmOptimizationMatched(
      {} as unknown as Recommendation['metadata'],
      null as unknown as Recommendation['preferences']
    )).toBe(true)
  })
})
