import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { OnDemandCliTab } from '.'

const cliList = {
  data: [
    {
      applyLater: true,
      cli: 'clock timezone us Pacific\nclock summer-time',
      id: '36e4d1dd8ab04cfb958aad3105e93aee',
      name: 'cli-test',
      reload: false
    }
  ],
  fields: [
    'name',
    'id',
    'venueSwitches'
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}


describe('Wired', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getCliTemplates.url,
        (_, res, ctx) => res(ctx.json(cliList)))
    )
  })

  it('should render onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Add CLI Template')).toBeVisible()
    expect(await screen.findByText('cli-test')).toBeVisible()
  })
})
