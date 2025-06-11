import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import AlarmsButton from './AlarmsButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

const alarmsData = {
  summary: {
    alarms: {
      summary: {
        major: 1
      },
      totalCount: 1
    }
  }
}

jest.mock('@acx-ui/rc/components', () => ({
  AlarmsDrawer: ({ visible }: { visible: boolean }) => visible && <div data-testid='AlarmsDrawer' />
}))

describe('AlarmsButton', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmSummaries.url,
        (req, res, ctx) => res(ctx.json(alarmsData))
      )
    )
  })

  it('should render AlarmsButton correctly', async () => {
    render(<Provider>
      <AlarmsButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByTestId('AlarmsDrawer')).toBeVisible()
  })
})
