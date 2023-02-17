import userEvent from '@testing-library/user-event'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockRestApiQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { activities } from './__tests__/activitiesFixtures'
import ActivityButton from './ActivityButton'

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate
}))

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

describe('ActivityButton', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
  })

  it('should render ActivityButton correctly', async () => {
    render(<Provider>
      <ActivityButton/>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByTitle('Pending'))
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should navigate to all activities', async () => {
    render(<Provider>
      <ActivityButton/>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'View all activities' }))
    expect(mockUseNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/t/a27e3eb0bd164e01ae731da8d976d3b1/timeline',
      search: ''
    })
  })

  it('should open/close activity drawer', async () => {
    render(<Provider>
      <ActivityButton/>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    const activity = await screen.findByText('123roam')
    expect(activity).toBeVisible()

    await userEvent.click(activity)
    let startTime = await screen.findByText('Start Time')
    expect(startTime).toBeVisible()
    await userEvent.click((await screen.findAllByRole('button', { name: 'Close' }))[1])
    expect(startTime).not.toBeVisible()

    await userEvent.click(activity)
    startTime = await screen.findByText('Start Time')
    expect(startTime).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(startTime).not.toBeVisible()
  })
})
