import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }        from '@acx-ui/feature-toggle'
import { venueApi }            from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  CommonRbacUrlsInfo,
  CONFIG_TEMPLATE_LIST_PATH
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { venueDetailHeaderData } from '../__tests__/fixtures'

import VenuePageHeader from './VenuePageHeader'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const mockedUseConfigTemplate = jest.fn()
const mockedUseConfigTemplateBreadcrumb = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate(),
  useConfigTemplateBreadcrumb: () => mockedUseConfigTemplateBreadcrumb()
}))

describe('VenuePageHeader', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (_, res, ctx) => res(ctx.json(venueDetailHeaderData))
      ),
      rest.post(
        CommonRbacUrlsInfo.getRwgListByVenueId.url,
        (req, res, ctx) => res(ctx.json({ response: { data: [] } }))
      )
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('navigate to edit when configure clicked', async () => {
    const params = { tenantId: 't1', venueId: 'v1' }
    render(<VenuePageHeader />, { route: { params }, wrapper: Provider })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    // expect(mockNavigate).toBeCalledWith(expect.objectContaining({
    //   pathname: '/t/t1/venues/v1/edit/details'
    // }))
    expect(mockNavigate).toBeCalledTimes(1)
  })

  it('render correctly with valid toggle', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const params = { tenantId: 't1', venueId: 'v1', activeTab: 'overview' }
    render(<VenuePageHeader />, { route: { params }, wrapper: Provider })
    const dateFilter = await screen.findByPlaceholderText('Start date')
    expect(dateFilter).toBeInTheDocument()
  })

  it('render correctly with isTemplate equal to true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    mockedUseConfigTemplateBreadcrumb.mockReturnValue([
      {
        text: 'Configuration Templates',
        link: CONFIG_TEMPLATE_LIST_PATH,
        tenantType: 'v'
      }
    ])

    const params = { tenantId: 't1', venueId: 'v1', activeTab: 'networks' }
    render(<VenuePageHeader />, { route: { params }, wrapper: Provider })
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: /configuration templates/i })).toBeInTheDocument()

    mockedUseConfigTemplateBreadcrumb.mockRestore()
  })
})
