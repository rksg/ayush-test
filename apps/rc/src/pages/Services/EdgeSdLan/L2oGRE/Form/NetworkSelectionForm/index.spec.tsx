import userEvent from '@testing-library/user-event'

import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkSelectionForm } from '.'

jest.mock('./VenueNetworkTable', () => ({
  EdgeSdLanVenueNetworksTable: () => <div data-testid='VenueNetworkTable' />
}))

describe('Edge SD-LAN form: NetworkSelection', () => {
  it('should render correctly', () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <NetworkSelectionForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Wi-Fi Network Selection')).toBeVisible()
    expect(screen.getByTestId('VenueNetworkTable')).toBeVisible()
  })

  it('should show error message when there is no network selected', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <NetworkSelectionForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Wi-Fi Network Selection')).toBeVisible()
    expect(screen.getByTestId('VenueNetworkTable')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please select at least 1 venue network')).toBeVisible()
  })
})
