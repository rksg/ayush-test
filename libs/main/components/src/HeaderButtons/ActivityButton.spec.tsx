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
      <ActivityButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByTitle('Pending'))
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should navigate to all activities', async () => {
    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'View all activities' }))
    expect(mockUseNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/a27e3eb0bd164e01ae731da8d976d3b1/t/timeline',
      search: ''
    })
  })

  it('should open/close activity drawer', async () => {
    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    const activity = await screen.findByText('123roam')

    await userEvent.click(activity)
    expect(await screen.findByText('Start Time')).toBeVisible()
    await userEvent.click((await screen.findAllByRole('button', { name: 'Close' }))[1])
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[1].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')

    await userEvent.click(screen.getAllByRole('button')[0])
    await userEvent.click(activity)
    expect(await screen.findByText('Start Time')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .not.toHaveClass('ant-drawer-content-wrapper-hidden')
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[1].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})
