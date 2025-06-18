import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkTemplateSelectionForm } from '.'

jest.mock('./VenueNetworkTable', () => ({
  // eslint-disable-next-line max-len
  EdgeSdLanVenueNetworksTemplateTable: () => <div data-testid='EdgeSdLanVenueNetworksTemplateTable' />
}))

describe('Edge SD-LAN form: Network Template Selection', () => {
  it('should render correctly', () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <NetworkTemplateSelectionForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Wi-Fi Network Template Selection')).toBeVisible()
    expect(screen.getByTestId('EdgeSdLanVenueNetworksTemplateTable')).toBeVisible()
  })
})
