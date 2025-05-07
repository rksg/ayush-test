import '@testing-library/jest-dom'
import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy, StepsFormLegacyInstance }             from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { venueApi }                                             from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store, userApi }                             from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor }       from '@acx-ui/test-utils'
import { UserUrlsInfo }                                         from '@acx-ui/user'

import {
  venueListResponse,
  networkDeepResponse,
  selfsignData,
  mock_SelfSignIn_SMS_ON,
  mock_SelfSignIn_SMS_Off,
  mockSMS_R1_Under100,
  mockSMS_R1_Over100,
  mockSMS_TWILIO_Under100,
  mockSMS_TWILIO_Over100,
  mockSMS_Unset_Over100,
  mockSMS_Unset_Under100,
  mock_SelfSignIn_WhatsApp_Error
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { SelfSignInForm } from './SelfSignInForm'

const services = require('@acx-ui/rc/services')
const SelfSignInFormNetworkComponent: React.FC = () => {
  const formRef = React.useRef<StepsFormLegacyInstance>()
  return (
    <StepsFormLegacy formRef={formRef}>
      <StepsFormLegacy.StepForm>
        <SelfSignInForm />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )}

jest.mock('../NetworkMoreSettings/NetworkMoreSettingsForm', () => ({
  NetworkMoreSettingsForm: () => <div data-testid='rc-NetworkMoreSettingsForm'/>
}))
jest.mocked(useIsSplitOn).mockReturnValue(false)
store.dispatch(userApi.util.resetApiState())
store.dispatch(venueApi.util.resetApiState())
services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
  return { data: mockSMS_R1_Over100 }
})

describe('CaptiveNetworkForm-SelfSignIn', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Self sign in network test'
    const selfSignInRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: selfsignData.guestPortal }
    const twilioData = {
      data: {
        accountSid: 'AC1234567890abcdef1234567890abcdef',
        authToken: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
        authTemplateSid: 'templateSid',
        apiKey: '29b04e7f-3bfb-4fed-b333-a49327981cab',
        url: 'test.com'
      }
    }
    const twilioWhatsAppData = { data: {
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
        accountSid: 'AC1234567890abcdef1234567890abcdef'
      },
      errorMessage: null,
      hasError: false
    } }

    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(selfSignInRes))),
      rest.get(AdministrationUrlsInfo.getNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json(twilioData))),
      rest.post(AdministrationUrlsInfo.getTwiliosWhatsappServices.url,
        (req, res, ctx) => res(ctx.json(twilioWhatsAppData)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should render Self sign in network successfully for snapshot test', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WHATSAPP_SELF_SIGN_IN_TOGGLE)
    const { asFragment } = render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: selfsignData, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should test Self sign in network successfully', async () => {
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: selfsignData, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Allowed Domains/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Allowed Domains/ }))
    const domainsInput = await screen.findByPlaceholderText('Enter domain(s) separated by comma')
    fireEvent.change(domainsInput, { target: { value: 'www.123.com,222.com' } })
    fireEvent.blur(domainsInput)
    await userEvent.click(await screen.findByRole('checkbox', { name: /email addresses of users/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /X/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Add'))
  })
  it('should create Self sign in network successfully', async () => {
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData, isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /X/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Add'))
  })
  it('should uncheck and disable SMS Token checkbox when clone network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockSMS_R1_Over100 }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: true, data: selfsignData, isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).not.toBeChecked()
    expect(formItem).toBeDisabled()
  })
  it('should be checked and editable SMS Token checkbox when clone network with FF off',
    async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.NUVO_SMS_PROVIDER_TOGGLE)
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Over100 }
      })
      render(<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: selfsignData, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).toBeChecked()
      expect(formItem).not.toBeDisabled()

      // eslint-disable-next-line
    const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')

      fireEvent.mouseOver(tooltips[0])
      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Self-service signup using one time token sent to a mobile number'
            }
          })
        ).toBeInTheDocument()
      })
    })
  it('should disable SMS Token checkbox when create network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockSMS_R1_Over100 }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData, isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).not.toBeChecked()
    expect(formItem).toBeDisabled()

    // eslint-disable-next-line
    const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')

    fireEvent.mouseOver(tooltips[0])

    await waitFor(async () => {
      expect(
        await screen.findByRole('tooltip', {
          value: {
            text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
          }
        })
      ).toBeInTheDocument()
    })
    expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()
  })
  it('should not disable SMS Token checkbox when edit network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockSMS_R1_Over100 }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: true, cloneMode: false, data: selfsignData, isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).toBeChecked()
    expect(formItem).not.toBeDisabled()
  })

  describe('SMS Tooltips Unit Tests, NUVO_SMS_PROVIDER_TOGGLE on',()=> {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    const SelfSignInComponent = (<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>)

    const router = { route: { params } }

    it('R1 - no left sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Over100 }
      })
      render(SelfSignInComponent, router)

      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeChecked()
      expect(formItem).toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()
    })
    it('R1 - remain sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Under100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-has-pool')).toBeInTheDocument()
    })
    it('Unset - no left sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Over100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeChecked()
      expect(formItem).toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()
    })
    it('Unset - remain sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Under100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()
    })
    it('Other Provider - no left sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_TWILIO_Over100 }
      })
      render(SelfSignInComponent, router)
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeDisabled()

      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(screen.queryByTestId('button-no-pool')).not.toBeInTheDocument()
      expect(screen.queryByTestId('button-has-pool')).not.toBeInTheDocument()
    })

    it('Other Provider - remain sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_TWILIO_Under100 }
      })
      render(SelfSignInComponent, router)
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(screen.queryByTestId('button-no-pool')).not.toBeInTheDocument()
      expect(screen.queryByTestId('button-has-pool')).not.toBeInTheDocument()
    })
  })
  // eslint-disable-next-line max-len
  describe('SMS Tooltips Unit Tests, NUVO_SMS_PROVIDER_TOGGLE and NUVO_SMS_GRACE_PERIOD_TOGGLE on',()=> {
    beforeEach(()=> {
      jest.mocked(useIsSplitOn).mockImplementation(ff => {
        return (ff === Features.NUVO_SMS_PROVIDER_TOGGLE ||
                ff === Features.NUVO_SMS_GRACE_PERIOD_TOGGLE)
      })
    })

    const SelfSignInComponent = (<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData, isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <SelfSignInFormNetworkComponent/>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>)

    const router = { route: { params } }

    it('R1 - no left sms', async () => {

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Over100 }
      })
      render(SelfSignInComponent, router)

      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(screen.queryByTestId('button-no-pool')).not.toBeInTheDocument()
    })
    it('R1 - remain sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Under100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).not.toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(screen.queryByTestId('button-has-pool')).not.toBeInTheDocument()
    })
    it('Unset - no left sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Over100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()
    })
    it('Unset - remain sms', async () => {
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Under100 }
      })
      render(SelfSignInComponent, router)
      // eslint-disable-next-line
      const tooltips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).toBeDisabled()

      fireEvent.mouseOver(tooltips[0])

      await waitFor(async () => {
        expect(
          await screen.findByRole('tooltip', {
            value: {
              text: 'Captive Portal Self-sign-in via SMS One-time Passcode.'
            }
          })
        ).toBeInTheDocument()
      })
      expect(await screen.findByTestId('button-no-pool')).toBeInTheDocument()
    })
  })
  describe('SMSTokenCheckbox Edit Mode', () => {

    it('R1, Over 100, SMS checked', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
      const SelfSignInComponent = (<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true, cloneMode: false, data: mock_SelfSignIn_SMS_ON, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>)

      const router = { route: { params } }

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Over100 }
      })
      render(SelfSignInComponent, router)

      expect(await screen.findByTestId('red-alert-message')).toBeInTheDocument()

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })

      fireEvent.click(formItem)

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()

      expect(formItem).toBeDisabled()
    })
    it('R1, Over 100, SMS unchecked',() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
      const SelfSignInComponent = (<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true, cloneMode: false, data: mock_SelfSignIn_SMS_Off, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>)

      const router = { route: { params } }

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Over100 }
      })
      render(SelfSignInComponent, router)

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })

      fireEvent.click(formItem)

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()

      expect(formItem).toBeDisabled()

    })
    it('R1, Under 100, SMS checked',() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
      const SelfSignInComponent = (<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true, cloneMode: false, data: mock_SelfSignIn_SMS_ON, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>)

      const router = { route: { params } }

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_R1_Under100 }
      })
      render(SelfSignInComponent, router)

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })

      fireEvent.click(formItem)

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()

      expect(formItem).not.toBeDisabled()
    })
    it('Unset, Under 100, SMS unchecked',() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
      const SelfSignInComponent = (<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true, cloneMode: false, data: mock_SelfSignIn_SMS_Off, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>)

      const router = { route: { params } }

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Under100 }
      })
      render(SelfSignInComponent, router)

      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })

      fireEvent.click(formItem)

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()

      expect(formItem).toBeDisabled()
    })

    it('Unset, WhatsApp still enabled',() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WHATSAPP_SELF_SIGN_IN_TOGGLE)
      const SelfSignInComponent = (<Provider>
        <NetworkFormContext.Provider
          value={{
            // eslint-disable-next-line max-len
            editMode: true, cloneMode: false, data: mock_SelfSignIn_WhatsApp_Error, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <SelfSignInFormNetworkComponent/>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>)

      const router = { route: { params } }

      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockSMS_Unset_Over100 }
      })
      render(SelfSignInComponent, router)

      const formItem = screen.getByRole('checkbox', { name: /WhatsApp/ })

      expect(screen.queryByTestId('red-alert-message')).not.toBeInTheDocument()

      fireEvent.click(formItem)

      expect(formItem).toBeDisabled()
    })
  })

})
