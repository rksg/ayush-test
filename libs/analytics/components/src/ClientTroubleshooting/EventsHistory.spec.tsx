import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { History } from './EventsHistory'

describe('EventsHistory', () => {
  it('should render correctly with out search params', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(
      <Provider>
        <History
          historyContentToggle
          setHistoryContentToggle={jest.fn()}
          filters={{
            category: undefined,
            type: undefined,
            radio: undefined
          }} />
      </Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByTestId('ArrowExpand')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})