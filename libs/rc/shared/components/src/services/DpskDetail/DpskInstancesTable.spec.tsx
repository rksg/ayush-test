import { ReactNode } from 'react'

import { rest } from 'msw'

import {
  CommonUrlsInfo,
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation,
  ConfigTemplateType,
  ConfigTemplateUrlsInfo,
  ConfigTemplateContext
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockedNetworks } from './__tests__/fixtures'
import DpskInstancesTable from './DpskInstancesTable'

const mockedRenderConfigTemplateDetailsComponent = jest.fn()
jest.mock('../../configTemplates', () => ({
  ...jest.requireActual('../../configTemplates'),
  renderConfigTemplateDetailsComponent: (type: ConfigTemplateType, id: string, name: ReactNode) => {
    mockedRenderConfigTemplateDetailsComponent({ type, id, name })
    return <div>{name}</div>
  }
}))

describe('DpskInstancesTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576',
    activeTab: DpskDetailsTabKey.OVERVIEW
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  mockServer.use(
    rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (req, res, ctx) => res(ctx.json(mockedNetworks))
    )
  )

  it('should render the table', async () => {
    const targetNetwork = mockedNetworks.data[0]
    const networkLink =
      `/${params.tenantId}/t/networks/wireless/${targetNetwork.id}/network-details/overview`

    render(
      <Provider>
        <DpskInstancesTable />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const targetRow = await screen.findByRole('link', { name: targetNetwork.name })
    expect(targetRow).toHaveAttribute('href', networkLink)
  })

  it('should render Network link for Config Template successfully', async () => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getNetworkTemplateList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworks))
      )
    )

    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider><DpskInstancesTable /></Provider>
      </ConfigTemplateContext.Provider>, { route: { params } }
    )

    const targetNetwork = mockedNetworks.data[0]

    await waitFor(() => {
      expect(mockedRenderConfigTemplateDetailsComponent).toHaveBeenCalledWith({
        type: ConfigTemplateType.NETWORK,
        name: targetNetwork.name,
        id: targetNetwork.id
      })
    })
  })
})
