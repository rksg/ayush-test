import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { activities } from './__tests__/activitiesFixtures'

import Timeline from './'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Timeline', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
  })

  it('should render', () => {
    render(
      <Provider>
        <Timeline />
      </Provider>,
      { route: { params } }
    )
    screen.getByText('Timeline')
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <Timeline />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Administration')).toBeVisible()
  })

  it('should change tab', async () => {
    render(
      <Provider>
        <Timeline />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByText('Events'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/timeline/events`,
      hash: '',
      search: ''
    })
  })
})
