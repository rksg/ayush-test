/* eslint-disable max-len */
import userEvent           from '@testing-library/user-event'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { rest }            from 'msw'

import {
  AdministrationUrlsInfo,
  NotificationRecipientUIModel,
  NotificationEndpoint,
  NotificationEndpointType
} from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import RecipientDialog, { RecipientDialogProps } from './RecipientDialog'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}
const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')
const exampleMobile = `+${examplePhoneNumber.getCountryCode()} ${examplePhoneNumber.getNationalNumberOrDefault()}`
describe('Recipient form dialog creation mode', () => {
  const dialogProps = {
    visible: true,
    setVisible: jest.fn(),
    editMode: false,
    editData: {} as NotificationRecipientUIModel,
    isDuplicated: jest.fn()
  } as RecipientDialogProps

  beforeEach(() => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addRecipient.url,
        (req, res, ctx) => {
          // mockedAddFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly work', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')
    const emailSwitchElem = (await screen.findAllByRole('switch'))
      .filter((elem) => elem.id === 'emailEnabled')[0]

    expect(emailSwitchElem).not.toEqual(undefined)
    expect(emailSwitchElem).toHaveAttribute('aria-checked', 'true')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    fireEvent.click(saveBtn)
  })

  it('should email validation works correctly', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@')
    let errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Please enter a valid email address')
    expect(errorMessage).toBeVisible()
    await userEvent.clear(emailInputElem)
    await userEvent.type(emailInputElem, 'test_user@ruckuswireless.com')
    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Please enter Name')
    expect(saveBtn).toBeDisabled()
  })


  it('should mobile validation works correctly', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '0912345678')
    const errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Please enter a valid phone number')
    expect(errorMessage).toBeVisible()
    await userEvent.clear(mobileInputElem)
    await userEvent.type(mobileInputElem, exampleMobile)
    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))
  })
})

describe('Recipient form dialog display correct toast message when request failed', () => {
  let mockedIsDuplicated = jest.fn()
  const dialogProps = {
    visible: true,
    setVisible: jest.fn(),
    editMode: false,
    editData: {} as NotificationRecipientUIModel,
    isDuplicated: mockedIsDuplicated
  } as RecipientDialogProps

  beforeEach(() => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addRecipient.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            errors: [{
              code: 'TNT-10100',
              message: 'Duplicate notification endpoint'
            }],
            requestId: '123456'
          }))
        }
      )
    )
  })

  it('should display correctly message when request failed with email endpoint duplicated', async () => {
    mockedIsDuplicated = jest.fn().mockImplementation((type: string) => {
      return type === NotificationEndpointType.email ? true : false
    })
    dialogProps.isDuplicated = mockedIsDuplicated

    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockedIsDuplicated).toBeCalledTimes(2)
    })

    expect(await screen.findByText('An error occurred: The email address you entered is already defined for another recipient. Please use an unique address.')).toBeVisible()
  })

  it('should display correctly message when request failed with mobile endpoint duplicated', async () => {
    mockedIsDuplicated = jest.fn().mockImplementation((type: string) => {
      return type === NotificationEndpointType.sms ? true : false
    })
    dialogProps.isDuplicated = mockedIsDuplicated

    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '+886912345678')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockedIsDuplicated).toBeCalledTimes(2)
    })

    expect(await screen.findByText('An error occurred: The mobile phone number you entered is already defined for another recipient. Please use a unique number.')).toBeVisible()
  })

  it('should display correctly message when request failed with email & mobile endpoint duplicated', async () => {
    mockedIsDuplicated = jest.fn().mockReturnValue(true)
    dialogProps.isDuplicated = mockedIsDuplicated

    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '+886912345678')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockedIsDuplicated).toBeCalledTimes(2)
    })

    expect(await screen.findByText('An error occurred: The email address and mobile phone number you entered are already defined for another recipient. Please use unique address and number.')).toBeVisible()
  })

  it('should display correctly message when request failed with duplicated not found TNT-10100 error', async () => {
    mockedIsDuplicated = jest.fn().mockReturnValue(false)
    dialogProps.isDuplicated = mockedIsDuplicated

    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '+886912345678')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockedIsDuplicated).toBeCalledTimes(2)
    })

    expect(await screen.findByText('An error occurred: Duplicate notification endpoint')).toBeVisible()
  })

  it('should display correctly message when request failed other non TNT-10100 error code', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addRecipient.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            errors: [{
              code: 'TNT-10000',
              message: 'Test Error Message'
            }],
            requestId: '123456'
          }))
        }
      )
    )

    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    expect(await screen.findByText('An error occurred: Test Error Message')).toBeVisible()
  })
})

describe('Recipient form dialog edit mode', () => {
  const dialogProps = {
    visible: true,
    setVisible: jest.fn(),
    editMode: true,
    editData: {
      id: 'afd39af2f9854963a61c38700089bc40',
      description: 'testUser',
      endpoints: [{
        type: 'EMAIL',
        id: '478127f284b84a6286aef6324613e3f4',
        createdDate: '2023-02-06T02:11:51.841+00:00',
        updatedDate: '2023-02-06T02:11:51.841+00:00',
        destination: 'test_user@gmail.com',
        active: true,
        status: 'OK'
      }] as NotificationEndpoint[],
      email: 'test_user@gmail.com',
      emailEnabled: true,
      mobile: '',
      mobileEnabled: false
    } as NotificationRecipientUIModel,
    isDuplicated: jest.fn()
  } as RecipientDialogProps
  const mockedUpdateFn = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateRecipient.url,
        (req, res, ctx) => {
          mockedUpdateFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly work', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Edit Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    expect(nameInputElem).toHaveValue('testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    expect(emailInputElem).toHaveValue('test_user@gmail.com')

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    expect(mobileInputElem).toHaveValue('')
    const switches = await screen.findAllByRole('switch')

    const emailSwitchElem = switches.filter((elem) => elem.id === 'emailEnabled')[0]
    expect(emailSwitchElem).not.toEqual(undefined)
    expect(emailSwitchElem).toHaveAttribute('aria-checked', 'true')

    const mobileSwitchElem = switches.filter((elem) => elem.id === 'mobileEnabled')[0]
    expect(mobileSwitchElem).not.toEqual(undefined)
    expect(mobileSwitchElem).toHaveAttribute('aria-checked', 'false')
  })

  it('should submit with correct data', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Edit Recipient')
    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.clear(emailInputElem)
    await userEvent.type(emailInputElem, 'another_test_user@gmail.com')

    const switches = await screen.findAllByRole('switch')
    const emailSwitchElem = switches.filter((elem) => elem.id === 'emailEnabled')[0]
    await userEvent.click(emailSwitchElem)

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '+886912345678')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    expect(mockedUpdateFn).toBeCalledWith({
      id: 'afd39af2f9854963a61c38700089bc40',
      description: 'testUser',
      endpoints: [{
        id: '478127f284b84a6286aef6324613e3f4',
        active: false,
        destination: 'another_test_user@gmail.com',
        type: NotificationEndpointType.email
      },{
        active: true,
        destination: '+886912345678',
        type: NotificationEndpointType.sms
      }]
    })
  })

  it('should submit with correct data when add email endpoint', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
          editData={{
            id: 'afd39af2f9854963a61c38700089bc40',
            description: 'testUser',
            endpoints: [{
              type: 'SMS',
              id: '478127f284b84a6286aef6324613e3f4',
              createdDate: '2023-02-06T02:11:51.841+00:00',
              updatedDate: '2023-02-06T02:11:51.841+00:00',
              destination: '+886912345678',
              active: true,
              status: 'OK'
            }] as NotificationEndpoint[],
            email: '',
            emailEnabled: false,
            mobile: '+886912345678',
            mobileEnabled: true
          } as NotificationRecipientUIModel}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Edit Recipient')
    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'another_test_user@gmail.com')

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.clear(mobileInputElem)
    await userEvent.type(mobileInputElem, '+886912345690')
    const smsSwitchElem = (await screen.findAllByRole('switch'))
      .filter((elem) => elem.id === 'mobileEnabled')[0]
    await userEvent.click(smsSwitchElem)

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    expect(mockedUpdateFn).toBeCalledWith({
      id: 'afd39af2f9854963a61c38700089bc40',
      description: 'testUser',
      endpoints: [{
        id: '478127f284b84a6286aef6324613e3f4',
        active: false,
        destination: '+886912345690',
        type: NotificationEndpointType.sms
      }, {
        active: true,
        destination: 'another_test_user@gmail.com',
        type: NotificationEndpointType.email
      }]
    })
  })

  it('should submit with correct data when add sms endpoint', async () => {
    render(
      <Provider>
        <RecipientDialog
          {...dialogProps}
          editData={{
            id: 'afd39af2f9854963a61c38700089bc40',
            description: 'testUser',
            endpoints: [{
              type: 'EMAIL',
              id: '478127f284b84a6286aef6324613e3f6',
              createdDate: '2023-02-06T02:11:51.841+00:00',
              updatedDate: '2023-02-06T02:11:51.841+00:00',
              destination: 'other_test_user@gmail.com',
              active: true,
              status: 'OK'
            }] as NotificationEndpoint[],
            email: 'other_test_user@gmail.com',
            emailEnabled: true,
            mobile: '',
            mobileEnabled: false
          } as NotificationRecipientUIModel}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Edit Recipient')
    await screen.findByPlaceholderText('Email')
    const mailSwitchElem = (await screen.findAllByRole('switch'))
      .filter((elem) => elem.id === 'emailEnabled')[0]
    await userEvent.click(mailSwitchElem)

    const mobileInputElem = await screen.findByPlaceholderText(exampleMobile)
    await userEvent.type(mobileInputElem, '+886912345678')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)

    expect(mockedUpdateFn).toBeCalledWith({
      id: 'afd39af2f9854963a61c38700089bc40',
      description: 'testUser',
      endpoints: [{
        id: '478127f284b84a6286aef6324613e3f6',
        active: false,
        destination: 'other_test_user@gmail.com',
        type: NotificationEndpointType.email
      }, {
        active: true,
        destination: '+886912345678',
        type: NotificationEndpointType.sms
      }]
    })
  })
})