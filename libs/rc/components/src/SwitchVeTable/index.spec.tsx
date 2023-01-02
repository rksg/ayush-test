import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { aclList, freeVePortVlans, routedList, successResponse, switchDetailHeader, switchList } from './__tests__/fixtures'

import { SwitchVeTable } from '.'



jest.mock('@acx-ui/icons', ()=> ({
  ...jest.requireActual('@acx-ui/icons'),
  SearchOutlined: () => <div data-testid='search-outlined' />,
  CancelCircle: () => <div data-testid='cancel-circle' />,
  CloseSymbol: () => <div data-testid='close-symbol' />,
  SettingsOutlined: (props: {}) => <div data-testid='settings-outlined' {...props} />,
  QuestionMarkCircleOutlined: () => <div data-testid='QuestionMarkCircleOutlined' />
}))


describe('Switch VE Table', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }


  beforeEach(() => {

    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteVePorts.url,
        (req, res, ctx) => res(ctx.json(successResponse))),
      rest.post(
        SwitchUrlsInfo.getSwitchRoutedList.url,
        (_, res, ctx) => res(ctx.json(routedList))),
      rest.post(
        SwitchUrlsInfo.addVePort.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(
        SwitchUrlsInfo.getAclUnion.url,
        (_, res, ctx) => res(ctx.json(aclList))),
      rest.get(
        SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(switchList))),
      rest.get(
        SwitchUrlsInfo.getFreeVePortVlans.url,
        (_, res, ctx) => res(ctx.json(freeVePortVlans))),
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailHeader))),
      rest.put(
        SwitchUrlsInfo.updateVePort.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render VE table correctly', async () => {
    render(<Provider><SwitchVeTable isVenueLevel={false} /></Provider>, {
      route: {
        params,
        path: '/:tenantId/:switchId'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/TEST-VE3/i)).toBeVisible()
  })

})