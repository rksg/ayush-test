import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { AdminLog, RequestPayload, TableQuery }        from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { render, screen }                              from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'

import { events, eventsMeta, fakeUserProfile } from './__tests__/fixtures'

import { AdminLogTable } from '.'

const params = { tenantId: 'tenant-id' }

describe('AdminLogTable', () => {
  const tableQuery = {
    data: { data: events.map(base =>
      ({ ...base, ...eventsMeta.find(meta => meta.id === base.id) }))
    },
    pagination: { current: 1, page: 1, pageSize: 10, total: 0 },
    handleTableChange: jest.fn()
  } as unknown as TableQuery<AdminLog, RequestPayload<unknown>, unknown>

  const userProfileContextValues = {
    data: fakeUserProfile
  } as UserProfileContextProps

  it('should render activity list', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <AdminLogTable tableQuery={tableQuery} />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <AdminLogTable tableQuery={tableQuery} />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    screen.getByText('Log Details')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Activity Details')).toBeNull()
  })

  it('should download csv on click', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <AdminLogTable tableQuery={tableQuery} />
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByTestId('DownloadOutlined'))
  })
})
