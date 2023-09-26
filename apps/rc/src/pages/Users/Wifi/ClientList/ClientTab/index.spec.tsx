import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { ClientTab } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ClientDualTable: () => <div data-testid={'clientDualTable'}></div>
}))

jest.mock('./CCD', () => ({
  ClientConnectionDiagnosis: () => <div data-testid={'clientConnectionDiagnosis'}></div>
}))


describe('ClientTab', () => {
  it('should render correctly', async () => {
    render(
      <ClientTab />
    )
    expect(await screen.findByTestId('clientDualTable')).toBeVisible()
  })

  it('should show the ContentSwitcher when the CCD feature flag is turned ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <ClientTab />
    )

    await userEvent.click(await screen.findByRole('radio', { name: 'Diagnostics' }))
    expect(await screen.findByTestId('clientConnectionDiagnosis')).toBeVisible()

    await userEvent.click(await screen.findByRole('radio', { name: 'Wireless Clients' }))
    expect(await screen.findByTestId('clientDualTable')).toBeVisible()

  })

})