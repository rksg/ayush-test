import '@testing-library/jest-dom'

import { rest } from 'msw'

import { MacRegListUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'

import MacRegistrationListTabs from './MacRegistrationListTabs'

const mockedUsedNavigate = jest.fn()
const params = { policyId: 'macRegistrationList-id', tenantId: 'tenant-id' }

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const list = {
  content: [
    {
      id: '6177e8a5-9cb4-40c6-bed4-74e9d104dfd8',
      expirationDate: '2065-12-08T18:40:01Z',
      revoked: false,
      macAddress: '11-22-33-44-55-66',
      username: 'testUser',
      email: 'testUser@commscope.com',
      createdDate: '2021-12-08T18:40:01Z'
    },
    {
      id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
      revoked: true,
      macAddress: '3A-B8-A9-29-35-D5',
      username: 'ex proident',
      email: 'dolore pariatur adipisicing esse Excepteur',
      createdDate: '2021-12-08T18:40:01Z',
      expirationDate: '2065-12-08T18:40:01Z'
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 2,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 2,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

describe('MacRegistrationListTab', () =>{
  mockServer.use(
    rest.get(
      MacRegListUrlsInfo.getMacRegistrations.url.split('?')[0],
      (req, res, ctx) => res(ctx.json(list))
    )
  )

  it('should render correctly', async () => {
    // eslint-disable-next-line max-len
    render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    await screen.findByText('Overview')
    await screen.findByText('MAC Registrations (' + list.totalElements + ')')
  })

  it('should handle tab changes', async () => {
    render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('MAC Registrations'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/policies/macRegistrationList/${params.policyId}/detail/macRegistrations`,
      hash: '',
      search: ''
    })
  })

})
