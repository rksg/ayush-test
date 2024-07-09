import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDHCPFixtures, EdgeDhcpUrls, getServiceRoutePath, NetworkSegmentationUrls, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                    from '@acx-ui/store'
import { mockServer, render, screen }                                                                                  from '@acx-ui/test-utils'

import { mockNsgStatsList } from '../__tests__/fixtures'

import NetworkSegmentationDetail from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PersonalIdentityNetworkServiceInfo: () =>
    <div data-testid='PersonalIdentityNetworkServiceInfo' />,
  PersonalIdentityNetworkDetailTableGroup: () =>
    <div data-testid='PersonalIdentityNetworkDetailTableGroup' />
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

const { mockEdgeDhcpDataList } = EdgeDHCPFixtures

describe('NsgDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.NETWORK_SEGMENTATION,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      )
    )
  })

  it('Should render detail page successfully', async () => {
    render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('nsg1')).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityNetworkServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('PersonalIdentityNetworkDetailTableGroup')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<NetworkSegmentationDetail />, {
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
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    const downloadConfigBtn = await screen.findByRole('button', { name: 'Download configs' })
    await user.click(downloadConfigBtn)
    expect(mockedZipAddFile).toBeCalledTimes(2)
    expect(mockedGenZipFile).toBeCalledTimes(1)
    expect(mockedSaveAs).toBeCalledTimes(1)
  })
})
