import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, SmsProviderType } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import { SetupSmsProviderDrawer } from './SetupSmsProviderDrawer'

// eslint-disable-next-line max-len
const validationMessage = 'We are not able to retrieve phone numbers from Twilio - please check the entered account SID and auth token'

const services = require('@acx-ui/rc/services')
const mockLazyQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: { incommingPhoneNumbers: [] } }
))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetTwiliosIncomingPhoneNumbersQuery: () => ([ mockLazyQuery ])
}))

describe('Set SMS Provider Drawer', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
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
  it('should render edit layout correctly for twililo data', async () => {
    const mockedCloseDrawer = jest.fn()
    const providerData = {
      providerType: SmsProviderType.TWILIO,
      providerData: {
        accountSid: 'sid123',
        authToken: 'token123',
        fromNumber: '123456789'
      }
    }
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          editData={providerData}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByDisplayValue('sid123')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly for twililo data with messaging ff on', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const providerData = {
      providerType: SmsProviderType.TWILIO,
      providerData: {
        accountSid: 'sid123',
        authToken: 'token123',
        fromNumber: '123456789'
      }
    }
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          editData={providerData}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByDisplayValue('sid123')).toBeVisible()
    expect(screen.getByText('Send messages through...')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Phone Number' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly for esendex data', async () => {
    const mockedCloseDrawer = jest.fn()
    const providerData = {
      providerType: SmsProviderType.ESENDEX,
      providerData: { apiKey: 'key123' }
    }
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          editData={providerData}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByText('key123')).toBeVisible()
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
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Twilio'))
    expect(await screen.findByText('Account SID')).toBeVisible()
    expect(await screen.findByText('Auth Token')).toBeVisible()
    expect(await screen.findByText('Phone Number')).toBeVisible()
    expect(screen.queryByText('Messaging Service')).toBeNull()

    await userEvent.click(screen.getAllByRole('combobox')[0])
    await userEvent.click(await screen.findByText('Esendex'))
    expect(await screen.findByText('API Key')).toBeVisible()
  })
  it('should validate account sid correctly for twilio provider', async () => {
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
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Twilio'))

    // Validate Account SID
    await userEvent.type(await screen.findByLabelText('Account SID'), '123')
    expect(await screen.findByText('This is not a valid account SID')).toBeVisible()
    await userEvent.clear(await screen.findByLabelText('Account SID'))
    await userEvent.type(await screen.findByLabelText('Account SID'),
      'AC12345678123456781234567812345678')
    await waitFor(() => {
      expect(screen.queryByText('This is not a valid account SID')).toBeNull()
    })
  })
  it('should validate auth token correctly for twilio provider', async () => {
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
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Twilio'))

    // Validate Auth Token
    await userEvent.type(await screen.findByLabelText('Auth Token'), '123')
    expect(await screen.findByText('This is not a valid Twilio auth token')).toBeVisible()
    await userEvent.clear(await screen.findByLabelText('Auth Token'))
    await userEvent.type(await screen.findByLabelText('Auth Token'),
      '12345678123456781234567812345678')
    await waitFor(() => {
      expect(screen.queryByText('This is not a valid Twilio auth token')).toBeNull()
    })
  })
  it('should validate phone number correctly for twilio provider', async () => {
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
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Twilio'))

    await userEvent.type(await screen.findByLabelText('Account SID'),
      'AC12345678123456781234567812345678')
    await userEvent.type(await screen.findByLabelText('Auth Token'),
      '12345678123456781234567812345678')

    // Validate Phone Number
    await userEvent.click(await screen.findByLabelText('Phone Number'))
    expect(await screen.findByText(validationMessage))
      .toBeVisible()
    await waitFor(() => {
      expect(screen.getByLabelText('Phone Number')).not.toBeEnabled()
    })

    mockLazyQuery.mockImplementation(() =>
      Promise.resolve(
        { data: { incommingPhoneNumbers: [ '111111111' ] } }
      ))

    await userEvent.clear(await screen.findByLabelText('Auth Token'))
    await userEvent.type(await screen.findByLabelText('Auth Token'),
      '12345678123456781234567812345678')
    await userEvent.click(await screen.findByLabelText('Phone Number'))
    await waitFor(() => {
      expect(screen.getByLabelText('Phone Number')).toBeEnabled()
    })
    await waitFor(() => {
      expect(screen.queryByText(validationMessage)).toBeNull()
    })
  })
  it('should save correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    mockLazyQuery.mockImplementation(() =>
      Promise.resolve(
        { data: { incommingPhoneNumbers: [ '111111111' ] } }
      ))

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
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Twilio'))

    await userEvent.type(await screen.findByLabelText('Account SID'),
      'AC12345678123456781234567812345678')
    await userEvent.type(await screen.findByLabelText('Auth Token'),
      '12345678123456781234567812345678')
    await userEvent.click(await screen.findByLabelText('Phone Number'))
    await waitFor(() => {
      expect(screen.getByLabelText('Phone Number')).toBeEnabled()
    })
  })
})

