import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                              from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls, getServiceRoutePath, NetworkSegmentationUrls, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                                  from '@acx-ui/store'
import { mockServer, render, screen }                                                                from '@acx-ui/test-utils'

import { mockEdgeDhcpDataList, mockNsgStatsList } from '../__tests__/fixtures'

import NetworkSegmentationDetail from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkSegmentationServiceInfo: () => <div data-testid='NetworkSegmentationServiceInfo' />,
  NetworkSegmentationDetailTableGroup: () =>
    <div data-testid='NetworkSegmentationDetailTableGroup' />
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
    expect(await screen.findByTestId('NetworkSegmentationServiceInfo')).toBeVisible()
    expect(await screen.findByTestId('NetworkSegmentationDetailTableGroup')).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NetworkSegmentationDetail />, {
      wrapper: Provider,
      route: { params, path: detailPath }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Network Segmentation'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkSegmentationDetail />, {
      wrapper: Provider,
      route: { params, path: detailPath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Network Segmentation'
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
