import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  within
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
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<OptionList optionData={list.data}
      updateOptionData={()=>{}}
      showOptionForm={()=>{}}/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await screen.findByText('option1')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar edit pool', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<OptionList optionData={list.data}
      updateOptionData={()=>{}}
      showOptionForm={()=>{}} />, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('option2'))
    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

  })

})
