import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import {
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgePinFixtures,
  getServiceRoutePath,
  EdgePinUrls,
  ServiceOperation,
  ServiceType,
  EdgeCompatibilityFixtures,
  EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import PersonalIdentityNetworkDetailEnhanced from '.'

const { mockPinStatsList } = EdgePinFixtures
const { mockEdgePinCompatibilities } = EdgeCompatibilityFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PersonalIdentityNetworkServiceInfo: () =>
    <div data-testid='PersonalIdentityNetworkServiceInfo' />
}))
jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  DiagramDetailTableGroup: () =>
    <div data-testid='DiagramDetailTableGroup' />
}))

const mockedGenZipFile = jest.fn().mockResolvedValue({})
const mockedZipAddFile = jest.fn()
jest.mock('jszip', () => (class JSZip {
  file
  generateAsync
  constructor () {
    this.file = mockedZipAddFile
    this.generateAsync = mockedGenZipFile
  }
}))

const mockedSaveAs = jest.fn()
jest.mock('file-saver', ()=>({ saveAs: () => mockedSaveAs() }))

const mockEdgeDhcpDataList = cloneDeep(EdgeDHCPFixtures.mockEdgeDhcpDataList)
// eslint-disable-next-line max-len
mockEdgeDhcpDataList.content[0].dhcpPools[0].id = mockPinStatsList.data[0].edgeClusterInfo.dhcpPoolId
mockEdgeDhcpDataList.content[0].dhcpPools[0].poolStartIp = '237.1.1.1'
mockEdgeDhcpDataList.content[0].dhcpPools[0].poolEndIp = '237.255.255.255'

describe('PIN Detail Enhanced', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.PIN,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    mockedGenZipFile.mockClear()
    mockedZipAddFile.mockClear()
    mockedSaveAs.mockClear()

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities)))
    )
  })

  it('Should render detail page successfully', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkDetailEnhanced />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('nsg1')).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityNetworkServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('DiagramDetailTableGroup')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<PersonalIdentityNetworkDetailEnhanced />, {
      wrapper: Provider,
      route: { params, path: detailPath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Personal Identity Network'
    })).toBeVisible()
  })

  it('Should download config successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkDetailEnhanced />
      </Provider>, {
        route: { params, path: detailPath }
      })
    const downloadConfigBtn = await screen.findByRole('button', { name: 'Download configs' })
    await user.click(downloadConfigBtn)
    expect(mockedZipAddFile).toBeCalledTimes(2)
    expect(mockedGenZipFile).toBeCalledTimes(1)
    expect(mockedSaveAs).toBeCalledTimes(1)
  })

  // eslint-disable-next-line max-len
  it('Should catch error and zip function should not be called when DHCP pool is insufficient', async () => {
    const user = userEvent.setup()
    const mockEdgeDhcps = cloneDeep(EdgeDHCPFixtures.mockEdgeDhcpDataList)
    // eslint-disable-next-line max-len
    mockEdgeDhcps.content[0].dhcpPools[0].id = mockPinStatsList.data[0].edgeClusterInfo.dhcpPoolId
    const spyOnConsoleLog = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(spyOnConsoleLog)

    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeDhcps.content[0]))
      )
    )

    render(
      <Provider>
        <PersonalIdentityNetworkDetailEnhanced />
      </Provider>, {
        route: { params, path: detailPath }
      })
    const downloadConfigBtn = await screen.findByRole('button', { name: 'Download configs' })
    await user.click(downloadConfigBtn)
    expect(spyOnConsoleLog).toBeCalledTimes(1)
    expect(mockedZipAddFile).toBeCalledTimes(0)
    expect(mockedGenZipFile).toBeCalledTimes(0)
    expect(mockedSaveAs).toBeCalledTimes(0)
  })

  it('should have compatible warning', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkDetailEnhanced />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(await screen.findByText('nsg1')).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityNetworkServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('DiagramDetailTableGroup')).toBeVisible()

    const sdlanWarning = await screen.findByText(/PIN is not able to be brought up on/)
    // eslint-disable-next-line testing-library/no-node-access
    const detailBtn = within(sdlanWarning.closest('.ant-space') as HTMLElement)
      .getByRole('button', { name: 'See details' })

    await userEvent.click(detailBtn)
    const compatibleInfoDrawer = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    expect(await within(compatibleInfoDrawer).findByText(/RUCKUS Edge Firmware/)).toBeInTheDocument()
    expect(within(compatibleInfoDrawer).getByText('2.1.0.200')).toBeValid()
    expect(within(compatibleInfoDrawer).getByText('5 / 14')).toBeValid()
  })
})
