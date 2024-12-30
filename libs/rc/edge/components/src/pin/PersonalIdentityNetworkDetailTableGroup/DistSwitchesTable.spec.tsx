import { rest } from 'msw'

import { pinApi }                       from '@acx-ui/rc/services'
import { EdgePinUrls, EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { DistSwitchesTable } from './DistSwitchesTable'

const { mockPinSwitchInfoData, mockWebAuthList } = EdgePinFixtures

describe('PersonalIdentityNetwork DetailTableGroup - DistSwitchesTable', () => {

  beforeEach(() => {
    store.dispatch(pinApi.util.resetApiState())

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
        <DistSwitchesTable dataSource={mockPinSwitchInfoData.distributionSwitches} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /FMN4221R00H---DS---3/i })
    expect(rows.length).toBe(1)
  })
})
