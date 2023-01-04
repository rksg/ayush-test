import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                                             from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { portlistData } from '../../../../__tests__/fixtures'

import { SwitchOverviewPorts } from '.'

const params = {
  tenantId: 'tenant-id'
}

describe('SwitchOverviewPorts', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlistData))
      )
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <SwitchOverviewPorts />
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findAllByText('1/1/1')
    await screen.findByRole('button', { name: 'Manage LAG' })
    expect(asFragment()).toMatchSnapshot()
  })
})
