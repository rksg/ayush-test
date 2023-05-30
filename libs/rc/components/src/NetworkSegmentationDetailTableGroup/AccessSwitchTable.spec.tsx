import { rest } from 'msw'

import { NetworkSegmentationUrls }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedNsgSwitchInfoData, webAuthList } from './__tests__/fixtures'
import { AccessSwitchTable }                    from './AccessSwitchTable'


describe('NetworkSegmentationDetailTableGroup - AccessSwitchTable', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('Should render AccessSwitchTable successfully', async () => {
    const accessSwitchData = mockedNsgSwitchInfoData.accessSwitches.map((as, idx) =>({
      ...as,
      distributionSwitchName: `DS-${idx}`
    }))
    render(
      <Provider>
        <AccessSwitchTable dataSource={accessSwitchData} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /FEK3224R09N---AS---3/i })
    expect(rows.length).toBe(1)
  })
})