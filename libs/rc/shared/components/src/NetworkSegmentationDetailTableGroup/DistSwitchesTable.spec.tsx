import { rest } from 'msw'

import { nsgApi }                     from '@acx-ui/rc/services'
import { NetworkSegmentationUrls }    from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedNsgSwitchInfoData, webAuthList } from './__tests__/fixtures'
import { DistSwitchesTable }                    from './DistSwitchesTable'


describe('NetworkSegmentationDetailTableGroup - DistSwitchesTable', () => {

  beforeEach(() => {
    store.dispatch(nsgApi.util.resetApiState())

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('Should render DistSwitchesTable successfully', async () => {
    render(
      <Provider>
        <DistSwitchesTable dataSource={mockedNsgSwitchInfoData.distributionSwitches} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /FMN4221R00H---DS---3/i })
    expect(rows.length).toBe(1)
  })
})
