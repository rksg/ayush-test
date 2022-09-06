import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { OptionDetail } from './OptionDetail'

const data =[
  {
    id: 2,
    optId: '21',
    name: 'Option1',
    format: '22',
    value: '22'
  },
  {
    id: 3,
    optId: '33',
    name: 'Option2',
    format: '22',
    value: '22'
  },
  {
    id: 4,
    optId: '44',
    name: 'Option3',
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
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<OptionDetail optionData={data}/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
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
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<OptionDetail optionData={data}/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })
    const addButton = screen.getByRole('button', { name: 'Add option' })
    await userEvent.click(addButton)
    const insertInput = screen.getByLabelText('Option Name')
    fireEvent.change(insertInput, { target: { value: 'Option name test' } })
    fireEvent.blur(insertInput)
    screen.getByText('Option name test')

  })

})
