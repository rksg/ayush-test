import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { AddMoreDetailsDrawer } from './index'
describe('AddMoreDetailsDrawer', () => {
  const props = {
    visible: true,
    setVisible: jest.fn(),
    widget: 'cpu',
    setWidget: jest.fn(),
    payload: {
      start: '2022-01-01',
      end: '2022-01-02',
      n: 5,
      filter: {}
    }
  }

  it('should render drawer layout correctly', async () => {
    render(
      <Provider>
        <AddMoreDetailsDrawer {...props}/>
      </Provider>, {
        route: {}
      })

    expect(screen.getByText('High CPU')).toBeVisible() })

  it('should close drawer', async () => {
    const setVisible = jest.fn()
    render(
      <Provider>
        <AddMoreDetailsDrawer
          {...props}
          setVisible={setVisible}/>
      </Provider>, {
        route: {}
      })
    await userEvent.click(screen.getByLabelText('Close'))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})