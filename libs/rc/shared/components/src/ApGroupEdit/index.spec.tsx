
import { rest } from 'msw'

import { useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { WifiRbacUrlsInfo, APGroupFixtures, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen }             from '@acx-ui/test-utils'

import { venuelist } from './__tests__/fixtures'

import { ApGroupEdit } from './index'
const { mockAPGroupList } = APGroupFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApGroupGeneralTab', () => ({
  ApGroupGeneralTab: () => <div data-testid={'generalTab'}></div>
}))

jest.mock('./ApGroupVlanRadioTab', () => ({
  ApGroupVlanRadioTab: () => <div data-testid={'vlanRadioTab'}></div>
}))

describe('AP Group Edit', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUsedNavigate.mockClear()

    mockServer.use(
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ))
  })

  it('should render correctly - Add ApGroup', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'add',
      activeTab: 'general'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )
    const title = await screen.findByText('Add AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(0)
    expect(await screen.findByTestId('generalTab')).toBeVisible()
  })

  it('should render correctly - Edit AP Group', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'edit',
      activeTab: 'vlanRadio'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    const title = await screen.findByText('Edit AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(2)

    expect(await screen.findByTestId('vlanRadioTab')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'General' }))

    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/tenant-id/t/devices/apgroups/apgroup-id/edit/general',
      search: ''
    })

  })
})
