import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { networkApi }      from '@acx-ui/rc/services'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  render,
  screen
} from '@acx-ui/test-utils'

import { OptionList } from './OptionsTable'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 12,
      optId: '12',
      name: 'option1',
      format: '12',
      value: '12'
    },
    {
      id: 13,
      optId: '13',
      name: 'option2',
      format: '13',
      value: '13'
    }
  ]
}

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create DHCP: Option table', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {

    const { asFragment } = render(<OptionList optionData={list.data}/>, {
      wrapper
    })

    await screen.findByText('option1')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar edit pool', async () => {

    render(<OptionList optionData={list.data}/>, {
      wrapper
    })

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    userEvent.click(screen.getByText('option1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    userEvent.click(screen.getByText('option2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

  })

})
