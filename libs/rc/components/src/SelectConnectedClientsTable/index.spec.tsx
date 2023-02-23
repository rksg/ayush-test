import { rest } from 'msw'

import { ClientUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import { SelectConnectedClientsTable } from './index'



describe('Select connected clients table', () => {
  const onRowChangeFn = jest.fn()

  it('Should render connected client table', async () => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [{
          osType: 'Windows',
          clientMac: '28:B3:71:28:78:50',
          ipAddress: '10.206.1.93',
          Username: '24418cc316df',
          hostname: 'LP-XXXXX',
          venueName: 'UI-TEST-VENUE',
          apName: 'UI team ONLY'
        }] }))
      )
    )

    render(
      <Provider>
        <SelectConnectedClientsTable onRowChange={onRowChangeFn} />
      </Provider>,
      { route: { params: { tenantId: 'mockedTenantId' } } }
    )

    await screen.findByText('MAC Address')
  })
})
