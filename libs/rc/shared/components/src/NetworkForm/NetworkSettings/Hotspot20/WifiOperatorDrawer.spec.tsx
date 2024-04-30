
import { rest } from 'msw'

import { WifiOperatorUrls } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockHotspot20OperatorList } from '../../__tests__/fixtures'

import WifiOperatorDrawer from './WifiOperatorDrawer'


describe('Add Wi-Fi Operator Drawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => res(ctx.json(mockHotspot20OperatorList))
      )
    )
  })

  const params = { tenantId: '123' }

  it('should render add Wi-Fi Operator drawer correctly', async () => {
    render(
      <Provider>
        <WifiOperatorDrawer
          visible={true}
          setVisible={jest.fn()}
          handleSave={jest.fn()} />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Wi-Fi Operator')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})