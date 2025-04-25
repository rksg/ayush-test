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
const phoneNumberValidationMessage = 'We are not able to retrieve phone numbers from Twilio - please check the entered account SID and auth token'
// eslint-disable-next-line max-len
const servicesValidationMessage = 'We are not able to retrieve messaging services from Twilio - please check the entered account SID and auth token'

const fakeProviderData = {
  providerType: SmsProviderType.TWILIO,
  providerData: {
    accountSid: 'AC76930bb18cb76e44e743bbd1572c5eaa',
    authToken: '3dc75201133cb439febd5c12e34a91f5',
    fromNumber: 'MFA[Test]'
  }
}

const services = require('@acx-ui/rc/services')
const mockLazyPhoneNumberQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: { incommingPhoneNumbers: ['123456789'] } }
))
const mockLazyMessagingQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: { messagingServiceResources: [] } }
))
const mockLazyWhatsappQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: {
    approvalFetch: {
      sid: 'sid',
      whatsapp: {
        allow_category_change: true,
        category: 'AUTHENTICATION',
        content_type: 'whatsapp/authentication',
        flows: null,
        name: 'guest_network_authentication',
        rejection_reason: '',
        status: 'approved',
        type: 'whatsapp'
      },
      url: 'https://content.twilio.com/v1/Content/sid/ApprovalRequests',
      accountSid: 'AC76930bb18cb76e44e743bbd1572c5eaa'
    },
    errorMessage: null,
    hasError: false
  } }
))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetTwiliosIncomingPhoneNumbersQuery: () => ([ mockLazyPhoneNumberQuery ]),
  useLazyGetTwiliosMessagingServicesQuery: () => ([ mockLazyMessagingQuery ]),
  useLazyGetTwiliosWhatsappServicesQuery: () => ([ mockLazyWhatsappQuery ])
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
  it('should render edit layout correctly for twilio data', async () => {
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
  it('should render edit layout correctly for twilio service data w/ messaging ff on', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockLazyMessagingQuery.mockImplementation(() => Promise.resolve(
      { data: { messagingServiceResources: ['Default[Test]', 'MFA[Test]'] } }
    ))
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          editData={fakeProviderData}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set SMS Provider')).toBeVisible()
    expect(screen.getByDisplayValue('AC76930bb18cb76e44e743bbd1572c5eaa')).toBeVisible()
    expect(screen.getByText('Send messages through...')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Messaging Service' })).toBeChecked()
    expect(await screen.findByText('MFA[Test]')).toBeVisible()
    await userEvent.click(screen.getByRole('radio', { name: 'Phone Number' }))
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Phone Number' })).toBeChecked())
    await userEvent.click(screen.getByRole('radio', { name: 'Messaging Service' }))
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Messaging Service' })).toBeChecked())
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly for twilio phone data w/ messaging ff on', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockLazyPhoneNumberQuery.mockImplementation(() => Promise.resolve(
      { data: { incommingPhoneNumbers: ['111111111', '123456789'] } }
    ))
    const providerData = { ...fakeProviderData }
    providerData.providerData.fromNumber = '123456789'
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
    expect(screen.getByDisplayValue('AC76930bb18cb76e44e743bbd1572c5eaa')).toBeVisible()
    expect(screen.getByText('Send messages through...')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Phone Number' })).toBeChecked()
    expect(await screen.findByText('123456789')).toBeVisible()
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
  it('should render edit layout correctly for other provider data', async () => {
    const mockedCloseDrawer = jest.fn()
    const providerData = {
      providerType: SmsProviderType.OTHERS,
      providerData: { apiKey: 'key123', url: 'test.com' }
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
    expect(screen.getByDisplayValue('test.com')).toBeVisible()
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
    mockLazyPhoneNumberQuery.mockImplementation(() =>
      Promise.resolve(
        { error: { data: { errorMessage: phoneNumberValidationMessage } } }
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

    // Validate Phone Number
    await userEvent.click(await screen.findByLabelText('Phone Number'))
    expect(await screen.findByText(phoneNumberValidationMessage))
      .toBeVisible()
    await waitFor(() => {
      expect(screen.getByLabelText('Phone Number')).not.toBeEnabled()
    })

    mockLazyPhoneNumberQuery.mockImplementation(() =>
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
      expect(screen.queryByText(phoneNumberValidationMessage)).toBeNull()
    })
  })
  it('should validate messaging service correctly for twilio provider', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockLazyMessagingQuery.mockImplementation(() => Promise.resolve(
      { error: { data: { errorMessage: servicesValidationMessage } } }
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

    // Validate Messaging Service
    await userEvent.click(await screen.findByRole('radio', { name: 'Messaging Service' }))
    expect(await screen.findByText(servicesValidationMessage)).toBeVisible()
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Messaging Service' })).not.toBeEnabled()
    })

    mockLazyMessagingQuery.mockImplementation(() =>
      Promise.resolve(
        { data: { messagingServiceResources: [ 'MFA[Test]' ] } }
      ))

    await userEvent.click(await screen.findByRole('radio', { name: 'Phone Number' }))
    await userEvent.click(await screen.findByRole('radio', { name: 'Messaging Service' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Messaging Service' })).toBeEnabled()
    })
    await waitFor(() => {
      expect(screen.queryByText(servicesValidationMessage)).toBeNull()
    })
  })
  it('should save correctly for twilio with phone number', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockLazyPhoneNumberQuery.mockImplementation(() => Promise.resolve(
      { data: { incommingPhoneNumbers: ['123456789'] } }
    ))
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn((type, cb) => cb && cb())}
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
    await userEvent.click(screen.getByRole('radio', { name: 'Phone Number' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Phone Number' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('combobox', { name: 'Phone Number' }))
    await userEvent.click((await screen.findAllByText('123456789'))[0])
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(()=>
      expect(services.useUpdateNotificationSmsProviderMutation).toHaveLastReturnedWith(value))
  })
  it('should save correctly for twilio with messaging service', async () => {
    const mockedCloseDrawer = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockLazyMessagingQuery.mockImplementation(() => Promise.resolve(
      { data: { messagingServiceResources: ['MFA[Test]'] } }
    ))
    render(
      <Provider>
        <SetupSmsProviderDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn((type, cb) => cb && cb())}
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
    await userEvent.click(screen.getByRole('radio', { name: 'Messaging Service' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Messaging Service' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('combobox', { name: 'Messaging Service' }))
    await userEvent.click((await screen.findAllByText('MFA[Test]'))[0])
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(()=>
      expect(services.useUpdateNotificationSmsProviderMutation).toHaveLastReturnedWith(value))
  })
  it('should save correctly for other provider', async () => {
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
    await userEvent.click(await screen.findByText('Other'))

    await userEvent.type(await screen.findByLabelText('API Key'),
      'AC12345678123456781234567812345678')
    await userEvent.type(await screen.findByLabelText('Send URL'), 'test.com')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(()=>
      expect(services.useUpdateNotificationSmsProviderMutation).toHaveLastReturnedWith(value))
  })
})

