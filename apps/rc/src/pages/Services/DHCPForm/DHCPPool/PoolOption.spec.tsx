import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { PoolOption } from './PoolOption'

const data = [
  {
    id: 2,
    optId: '21',
    optName: 'Option1',
    format: '22',
    value: '22'
  },
  {
    id: 3,
    optId: '33',
    optName: 'Option2',
    format: '22',
    value: '22'
  },
  {
    id: 4,
    optId: '44',
    optName: 'Option3',
    format: '22',
    value: '22'
  }
]

function wrapper ({ children }: { children: React.ReactElement }) {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe('Create DHCP: Option detail', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(data))
      )
    )
    const { asFragment } = render(<PoolOption value={data}/>, {
      wrapper
    })

    await screen.findByText('Add option')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar add option', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(data))
      )
    )
    const params = { tenantId: 'tenant-id' }

    render(<PoolOption value={data} />, {
      wrapper,
      route: { params }
    })

    const addButton = screen.getByRole('button', { name: 'Add option' })
    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Option ID' }),'21')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Name' }),'option1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Format' }),'IP')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Value' }),'1.1.1.1')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))


    await userEvent.type(screen.getByRole('textbox', { name: 'Option ID' }),'11')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  })
})
