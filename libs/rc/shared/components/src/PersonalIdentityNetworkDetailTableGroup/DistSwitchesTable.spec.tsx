import { rest } from 'msw'

import { nsgApi }                       from '@acx-ui/rc/services'
import { EdgePinUrls, EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { DistSwitchesTable } from './DistSwitchesTable'

const { mockNsgSwitchInfoData, mockWebAuthList } = EdgePinFixtures

describe('NetworkSegmentationDetailTableGroup - DistSwitchesTable', () => {

  beforeEach(() => {
    store.dispatch(nsgApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgePinUrls.getWebAuthTemplateList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockWebAuthList }))
      )
    )
  })

  it('Should render DistSwitchesTable successfully', async () => {
    render(
      <Provider>
        <DistSwitchesTable dataSource={mockNsgSwitchInfoData.distributionSwitches} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /FMN4221R00H---DS---3/i })
    expect(rows.length).toBe(1)
  })
})
