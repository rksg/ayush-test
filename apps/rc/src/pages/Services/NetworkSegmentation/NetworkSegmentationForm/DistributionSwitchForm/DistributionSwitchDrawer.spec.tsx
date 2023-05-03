import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { NetworkSegmentationUrls }                     from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockNsgData, mockNsgSwitchInfoData } from '../../__tests__/fixtures'

import { DistributionSwitchDrawer } from './DistributionSwitchDrawer'


describe('DistributionSwitchDrawer', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const path = '/:tenantId/t/services/networkSegmentation/:serviceId/edit'
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getAccessSwitchesByDS.url,
        (req, res, ctx) => res(ctx.json({ switchViewList: mockNsgSwitchInfoData.accessSwitches }))
      )
    )
  })

  it('Should render successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <DistributionSwitchDrawer open={true}
          availableSwitches={mockNsgSwitchInfoData.distributionSwitches}
          selectedSwitches={[]}
          edgeId={mockNsgData.edgeInfos[0].edgeId}
          venueId={mockNsgData.venueInfos[0].venueId} />
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Add Distribution Switch/i)

    await user.click(await screen.findByRole('button', { name: 'Select' }))

    await screen.findByText(/Available Access Switch/i)
  })

  it('Should edit successfully', async () => {
    const user = userEvent.setup()
    const requestSpy = jest.fn()

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ valid: true }))
        }
      )
    )
    render(
      <Provider>
        <DistributionSwitchDrawer open={true}
          editRecord={mockNsgSwitchInfoData.distributionSwitches[0]}
          availableSwitches={[]}
          selectedSwitches={mockNsgSwitchInfoData.distributionSwitches}
          edgeId={mockNsgData.edgeInfos[0].edgeId}
          venueId={mockNsgData.venueInfos[0].venueId} />
      </Provider>, {
        route: { params, path }
      })
    const dsInput = await screen.findByRole('textbox',{ name: 'Distribution Switch' })
    expect(dsInput).toHaveValue('FMN4221R00H---DS---3')

    expect(screen.getByRole('textbox', {
      name: 'Lookback Interface IP Address' })).toHaveValue('1.2.3.4')

    await user.click(await screen.findByRole('button', { name: 'Select' }))

    const dialog = await screen.findByRole('dialog', { name: /Select Access Switches/i })

    await within(dialog).findByText(/FEK3224R09N---AS---3/i)

    await user.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })
})
