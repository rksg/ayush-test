import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ShowMembersDrawer } from './ShowMembersDrawer'

const lastLogins =
{
  count: 2,
  lastLoginList: [
    {
      email: 'smercik0@corporate.com',
      lastLoginDate: '2024-01-09T21:01:53.000Z'
    },
    {
      email: 'kmacswayde1@corporate.com',
      lastLoginDate: '2024-01-11T21:11:53.000Z'
    }
  ]
}
const services = require('@acx-ui/rc/services')

describe('Show member last login table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetAdminGroupLastLoginsQuery = jest.fn().mockImplementation(() => {
      return { data: lastLogins }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render table', async () => {
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={jest.fn()} />
      </Provider>, { route: { params } })

    // eslint-disable-next-line testing-library/no-node-access
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Logged Group Members (2)')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeVisible()
  })
  it('should render correctly when no data', async () => {
    services.useGetAdminGroupLastLoginsQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={jest.fn()} />
      </Provider>, { route: { params } })

    // eslint-disable-next-line testing-library/no-node-access
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Logged Group Members (0)')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeVisible()
  })
  it('should load data correctly', async () => {
    const mockedSetVisible = jest.fn()
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={mockedSetVisible} />
      </Provider>, { route: { params }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(3)

    expect(screen.getByText('smercik0@corporate.com')).toBeVisible()
    expect(screen.getByText('kmacswayde1@corporate.com')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Ok' }))
    expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
  })
  it('should close correctly', async () => {
    const mockedSetVisible = jest.fn()
    render(
      <Provider>
        <ShowMembersDrawer
          visible={true}
          membersGroupId={'msp.eleu1658@mail.com'}
          setVisible={mockedSetVisible} />
      </Provider>, { route: { params }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    await screen.findAllByRole('row')

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
  })
})
