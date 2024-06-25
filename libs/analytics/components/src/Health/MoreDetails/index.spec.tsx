import userEvent from '@testing-library/user-event'

import { Provider, store, dataApiURL } from '@acx-ui/store'
import {
  render,
  screen,
  mockGraphqlQuery
} from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { mockConnectionDrillDown } from '../HealthDrillDown/__tests__/fixtures'
import { api }                     from '../HealthDrillDown/services'

import { MoreDetailsDrawerProps, MoreDetailsDrawer } from './index'

describe('MoreDetailsDrawer', () => {
  const props = {
    visible: true,
    setVisible: jest.fn(),
    widget: 'successCount',
    setWidget: jest.fn(),
    filters: {
      startDate: '2022-01-01',
      endDate: '2022-01-02',
      filter: {}
    } as AnalyticsFilter
  } as MoreDetailsDrawerProps

  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
  })

  it('should render drawer layout correctly', () => {
    render(
      <Provider>
        <MoreDetailsDrawer {...props}/>
      </Provider>, {
        route: {}
      })

    expect(screen.getByText('Successful Connections')).toBeVisible()
  })

  it('should close drawer', async () => {
    const setVisible = jest.fn()
    render(
      <Provider>
        <MoreDetailsDrawer
          {...props}
          setVisible={setVisible}/>
      </Provider>, {
        route: {}
      })
    const icon = await screen.findByTestId('CloseSymbol')
    expect(icon).toBeVisible()
    await userEvent.click(icon)
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})
