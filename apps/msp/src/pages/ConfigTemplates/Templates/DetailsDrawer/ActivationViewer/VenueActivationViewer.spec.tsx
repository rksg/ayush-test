import { rest } from 'msw'

import { venueConfigTemplateApi }                                                                                    from '@acx-ui/rc/services'
import { ApGroupConfigTemplateUrlsInfo, ConfigTemplateType, ConfigTemplateUrlsInfo, PoliciesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                           from '@acx-ui/store'
import { render, screen, waitFor, mockServer }                                                                       from '@acx-ui/test-utils'

import { DetailsItemListProps } from '../DetailsContent'

import { VenueActivationViewer } from './VenueActivationViewer'

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
    store.dispatch(venueConfigTemplateApi.util.resetApiState())

    jest.clearAllMocks()
  })

  it('should return venues names for network when data is loaded', async () => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getNetworkTemplateListRbac.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [{ id: '1234567890', venueApGroups: [{
            venueId: '3f10af1401'
          }] }]
        }))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateListRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [{ id: '3f10af1401', name: 'Venue 1' }]
        }))
      )
    )

    render(<Provider>
      <VenueActivationViewer type={ConfigTemplateType.NETWORK} templateId={mockTemplateId} />
    </Provider>)

    expect(screen.getByText('Venues')).toBeInTheDocument()
    expect(await screen.findByText('Venue 1')).toBeInTheDocument()
  })

  it('should handle empty data', async () => {
    const mockGetSyslogFn = jest.fn()
    mockServer.use(
      rest.post(
        PoliciesConfigTemplateUrlsInfo.querySyslog.url,
        (_, res, ctx) => {
          mockGetSyslogFn()
          return res(ctx.json({
            totalCount: 1, page: 1, data: [{ id: '12345' }]
          }))
        }
      )
    )

    render(<Provider>
      <VenueActivationViewer type={ConfigTemplateType.SYSLOG} templateId={mockTemplateId} />
    </Provider>)

    await waitFor(() => expect(mockGetSyslogFn).toHaveBeenCalled())
    expect(await screen.findByText('No data')).toBeInTheDocument()
  })

  it('should return venue names for other type templates when data is loaded', async () => {
    mockServer.use(
      rest.post(
        ApGroupConfigTemplateUrlsInfo.getApGroupsListRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [{ id: '1234567890', venueId: '3f10af1401b' }]
        }))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateListRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1, page: 1, data: [{ id: '3f10af1401b', name: 'Venue 1' }]
        }))
      )
    )

    render(<Provider>
      <VenueActivationViewer type={ConfigTemplateType.AP_GROUP} templateId={mockTemplateId} />
    </Provider>)

    expect(await screen.findByText('Venue 1')).toBeInTheDocument()
  })
})