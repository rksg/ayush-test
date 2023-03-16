import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { NetworkSegmentationUrls, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, screen }              from '@acx-ui/test-utils'

import { mockNsgData, mockNsgSwitchInfoData, switchPortList, switchVlanUnion, switchLagList, webAuthList } from '../../__tests__/fixtures'

import { AccessSwitchDrawer } from './AccessSwitchDrawer'


describe('AccessSwitchDrawer', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const path = '/:tenantId/services/networkSegmentation/:serviceId/edit'
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: switchPortList }))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchVlanUnion.url,
        (req, res, ctx) => res(ctx.json(switchVlanUnion))
      ),
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(switchLagList))
      ),
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({ ...webAuthList[0] }))
      ),
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('Should render successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AccessSwitchDrawer open={true}
          editRecords={mockNsgSwitchInfoData.accessSwitches}
          venueId={mockNsgData.venueInfos[0].venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Edit Access Switch: FEK3224R09N---AS---3/i)

    await screen.findByText(/top-Ken-0209/i)

    await user.click(await screen.findByText(/LAG/))

    await user.click(await screen.findByRole('button', { name: 'Customize' }))

    const templateSelectBtn = await screen.findByRole('button', { name: 'Select Auth Template' })

    await user.click(templateSelectBtn)

    await screen.findByRole('button', { name: 'Customize' })
  })
})
