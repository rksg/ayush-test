
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import  { TimeLine } from './EventsTimeline'

describe('ApTroubleShooting', () => {
  it('should render correctly with out search params', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    render(
      <Provider>
        <TimeLine />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByText('Connection Events')).toBeVisible()
  })
})