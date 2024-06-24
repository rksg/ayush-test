import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { SetupSmsProviderDrawer } from './SetupSmsProviderDrawer'

const services = require('@acx-ui/rc/services')

describe('Set SMS Provider Drawer', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    jest.spyOn(services, 'useUpdateNotificationSmsProviderMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.updateNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render add layout correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should close drawer when cancel button clicked', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
  it('should render correctly for selected SMS provider', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()

    // await userEvent.click(screen.getAllByRole('radio')[1])
    // expect(screen.getByText('Client ID')).toBeVisible()
    // expect(screen.getByText('Client secret')).toBeVisible()
    // expect(screen.queryByText('IdP Metadata')).toBeNull()

    // await userEvent.click(screen.getAllByRole('radio')[0])
    // expect(screen.getByText('IdP Metadata')).toBeVisible()
    // expect(screen.queryByText('Client ID')).toBeNull()
    // expect(screen.queryByText('Client secret')).toBeNull()
  })
})
