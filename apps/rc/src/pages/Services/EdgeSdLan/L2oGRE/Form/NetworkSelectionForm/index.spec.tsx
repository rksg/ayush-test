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
})
