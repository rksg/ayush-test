import { rest } from 'msw'

import { ConfigTemplateType, ConfigTemplateUrlsInfo, ServicesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                   from '@acx-ui/store'
import { render, screen, waitFor, mockServer }                                        from '@acx-ui/test-utils'

import { DetailsItemListProps } from '../DetailsContent'

import { NetworkActivationViewer } from './NetworkActivationViewer'

jest.mock('../DetailsContent', () => ({
  DetailsItemList: (props: DetailsItemListProps) => {
    return <div>
      <span>{props.title}</span>
      {props.isLoading
        ? <div>Loading...</div>
        : props.items.length > 0
          ? <div>{props.items.map(item => <div key={item}>{item}</div>)}</div>
          : <div>No data</div>}
    </div>
  }
}))

describe('NetworkActivationViewer', () => {
  const mockTemplateId = 'test-template-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return network names for venue when data is loaded', async () => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateListRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1,
          page: 1,
          data: [
            {
              id: '3f10af1401b44902a88723cb68c4bc77',
              networks: {
                count: 2,
                names: ['Network Template 1', 'Network Template 2'],
                vlans: []
              }
            }
          ]
        }))
      )
    )

    render(<Provider>
      <NetworkActivationViewer type={ConfigTemplateType.VENUE} templateId={mockTemplateId} />
    </Provider>)

    expect(screen.getByText('Active on Networks')).toBeInTheDocument()
    expect(await screen.findByText('Network Template 1')).toBeInTheDocument()
    expect(await screen.findByText('Network Template 2')).toBeInTheDocument()
  })

  it('should handle empty data', async () => {
    const mockGetDpskFn = jest.fn()
    mockServer.use(
      rest.get(
        ServicesConfigTemplateUrlsInfo.getDpsk.url,
        (req, res, ctx) => {
          mockGetDpskFn()
          return res(ctx.json({
            id: '4b76b1952c80401b8500b00d68106576',
            name: 'Fake DPSK Template'
          }))
        }
      )
    )

    render(<Provider>
      <NetworkActivationViewer type={ConfigTemplateType.DPSK} templateId={mockTemplateId} />
    </Provider>)

    await waitFor(() => expect(mockGetDpskFn).toHaveBeenCalled())

    expect(await screen.findByText('No data')).toBeInTheDocument()
  })

  it('should return network names for non-venue type templates when data is loaded', async () => {
    const mockGetDpskFn = jest.fn()
    mockServer.use(
      rest.get(
        ServicesConfigTemplateUrlsInfo.getDpsk.url,
        (req, res, ctx) => {
          mockGetDpskFn()
          return res(ctx.json({
            id: '4b76b1952c80401b8500b00d68106576',
            name: 'Fake DPSK Template',
            networkIds: ['1234567890']
          }))
        }
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getNetworkTemplateListRbac.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [{ id: '1234567890', name: 'Network A' }]
        }))
      )
    )

    render(<Provider>
      <NetworkActivationViewer type={ConfigTemplateType.DPSK} templateId={mockTemplateId} />
    </Provider>)

    expect(await screen.findByText('Network A')).toBeInTheDocument()
  })
})
