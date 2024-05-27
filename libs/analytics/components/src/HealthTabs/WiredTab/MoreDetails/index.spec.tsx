import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { MoreDetailsDrawerProps } from './index'
import { MoreDetailsDrawer }      from './index'

describe('MoreDetailsDrawer', () => {
  const props = {
    visible: true,
    setVisible: jest.fn(),
    widget: 'cpuUsage',
    setWidget: jest.fn(),
    filters: {
      startDate: '2022-01-01',
      endDate: '2022-01-02',
      filter: {}
    } as AnalyticsFilter
  } as MoreDetailsDrawerProps

  it('should render drawer layout correctly', async () => {
    render(
      <Provider>
        <MoreDetailsDrawer {...props}/>
      </Provider>, {
        route: {}
      })

    expect(screen.getByText('High CPU')).toBeVisible() })

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
    await userEvent.click(screen.getByLabelText('Close'))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})
