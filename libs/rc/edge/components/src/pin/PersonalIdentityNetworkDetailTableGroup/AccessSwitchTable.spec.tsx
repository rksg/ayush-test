import { rest } from 'msw'

import { EdgePinUrls, EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { AccessSwitchTable } from './AccessSwitchTable'

const { mockPinSwitchInfoData, mockWebAuthList } = EdgePinFixtures

describe('PersonalIdentityNetwork DetailTableGroup - AccessSwitchTable', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgePinUrls.getWebAuthTemplateList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockWebAuthList }))
      )
    )
  })

  it('Should render AccessSwitchTable successfully', async () => {
    const accessSwitchData = mockPinSwitchInfoData.accessSwitches.map((as, idx) =>({
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
