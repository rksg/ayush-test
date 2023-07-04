import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
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

  it('should not render breadcrumb when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <Timeline />
      </Provider>,
      { route: { params } }
    )
    expect(screen.queryByText('Administration')).toBeNull()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
