import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { StepsFormLegacy }                  from '@acx-ui/components'
import { NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { render, screen, cleanup, waitFor } from '@acx-ui/test-utils'

import NetworkFormContext from '../NetworkFormContext'

import { RedirectUrlInput } from './RedirectUrlInput'

// Mock data for testing
const mockNetworkWithRedirectUrl: NetworkSaveData = {
  type: NetworkTypeEnum.CAPTIVEPORTAL,
  guestPortal: {
    redirectUrl: 'http://example.com',
    enableSelfService: true,
    maxDevices: 1,
    endOfDayReauthDelay: false,
    macCredentialsDuration: 240,
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    guestPage: {
      wifi4Eu: false
    },
    socialEmails: false,
    userSessionTimeout: 1440,
    userSessionGracePeriod: 60
  },
  tenantId: '4c39ee6b1107452c83a03c2358a4388c',
  enableDhcp: false,
  enableAuthProxy: false,
  enableAccountingProxy: false,
  portalServiceProfileId: 'e7a01792-63c0-4231-b205-711db0dddfb6',
  name: 'Test Network',
  id: '674ff0a3f5a74e018b0ceeacb790516d'
}

const mockNetworkWithoutRedirectUrl: NetworkSaveData = {
  ...mockNetworkWithRedirectUrl,
  guestPortal: {
    ...mockNetworkWithRedirectUrl.guestPortal,
    redirectUrl: undefined
  }
}

describe('RedirectUrlInput Unit Test', () => {
  afterEach(() => {
    cleanup()
  })

  describe('useEffect functionality', () => {
    it('should set redirectCheckbox to true when in edit mode and redirectUrl exists', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: true,
              cloneMode: false,
              data: mockNetworkWithRedirectUrl
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the checkbox is checked
      const checkbox = screen.getByRole('checkbox')
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    // eslint-disable-next-line max-len
    it('should set redirectCheckbox to true when in clone mode and redirectUrl exists', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: true,
              data: mockNetworkWithRedirectUrl
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the checkbox is checked
      const checkbox = screen.getByRole('checkbox')
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    it('should not set redirectCheckbox to true when not in edit or clone mode', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false,
              data: mockNetworkWithRedirectUrl
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the checkbox is not checked (default is false)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    // eslint-disable-next-line max-len
    it('should not set redirectCheckbox to true when in edit mode but redirectUrl does not exist', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: true,
              cloneMode: false,
              data: mockNetworkWithoutRedirectUrl
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the checkbox is not checked
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    // eslint-disable-next-line max-len
    it('should not set redirectCheckbox to true when in clone mode but redirectUrl does not exist', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: true,
              data: mockNetworkWithoutRedirectUrl
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the checkbox is not checked
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should handle null/undefined data gracefully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: true,
              cloneMode: false,
              data: undefined
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the component renders without errors
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('RedirectUrlInput functionality', () => {
    it('should enable the URL input when checkbox is checked', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false,
              data: {}
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Initially the input should be disabled
      const input = screen.getByPlaceholderText('e.g. http://www.example.com')
      expect(input).toBeDisabled()

      // Check the checkbox
      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      // Now the input should be enabled
      expect(input).not.toBeDisabled()
    })

    it('should clear the URL input when checkbox is unchecked', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false,
              data: {}
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <RedirectUrlInput />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check the checkbox
      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      // Enter a URL
      const input = screen.getByPlaceholderText('e.g. http://www.example.com')
      await userEvent.type(input, 'http://test.com')
      expect(input).toHaveValue('http://test.com')

      // Uncheck the checkbox
      await userEvent.click(checkbox)

      // The input should be cleared and disabled
      expect(input).toHaveValue('')
      expect(input).toBeDisabled()
    })
  })
})
