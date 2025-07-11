import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import { ApGroupEditContext } from '../context'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'

jest.mock('@acx-ui/rc/services', () => ({
  useGetApGroupClientAdmissionControlQuery: jest.fn(() => ({
    data: {
      useVenueSettings: true,
      enable24G: true,
      enable50G: false,
      minClientCount24G: 10,
      minClientCount50G: 20,
      maxRadioLoad24G: 75,
      maxRadioLoad50G: 75,
      minClientThroughput24G: 0,
      minClientThroughput50G: 0
    },
    isLoading: false
  })),
  useUpdateApGroupClientAdmissionControlMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useLazyGetVenueClientAdmissionControlQuery: jest.fn(() => [jest.fn()])
}))

describe('ApGroup Client Admission Control Settings', () => {
  const contextValue = {
    venueId: 'venue-id',
    editContextData: {
      tabTitle: '',
      isDirty: false,
      severity: '',
      unsavedTabKey: ''
    },
    setEditContextData: jest.fn(),
    editRadioContextData: {
      isClientAdmissionControlDataChanged: false,
      updateClientAdmissionControl: jest.fn(),
      discardClientAdmissionControl: jest.fn()
    },
    setEditRadioContextData: jest.fn(),
    isRbacEnabled: true,
    isEditMode: true,
    previousPath: '',
    setPreviousPath: jest.fn(),
    apGroupApCaps: undefined
  }

  it('should render correctly and show inherited settings by default', async () => {
    render(
      <ApGroupEditContext.Provider value={contextValue}>
        <Form>
          <ClientAdmissionControlSettings />
        </Form>
      </ApGroupEditContext.Provider>
    )
    expect(await screen.findByTestId('ap-radiosettings-useVenueOrApGroupSettings')).toBeChecked()
    expect(screen.getByTestId('ap-radiosettings-customize')).not.toBeChecked()
    expect(screen.getByTestId('client-admission-control-enable-24g')).toBeVisible()
    expect(screen.getByTestId('client-admission-control-enable-50g')).toBeVisible()
  })

  it('should switch to customize settings when radio is toggled', async () => {
    render(
      <ApGroupEditContext.Provider value={contextValue}>
        <Form>
          <ClientAdmissionControlSettings />
        </Form>
      </ApGroupEditContext.Provider>
    )
    const customizeRadio = await screen.findByTestId('ap-radiosettings-customize')
    await userEvent.click(customizeRadio)
    expect(customizeRadio).toBeChecked()
    // Optionally check if form fields are enabled for editing
  })
})