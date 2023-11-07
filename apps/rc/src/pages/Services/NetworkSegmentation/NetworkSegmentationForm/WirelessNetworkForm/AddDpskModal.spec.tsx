import { render, screen } from '@acx-ui/test-utils'

import { AddDpskModal } from './AddDpskModal'

jest.mock('../../../../Networks/wireless/NetworkForm/NetworkForm', () => ({
  default: <div data-testid='NetworkForm' />
}))

describe('NSG WirelessNetwork Form - AddDpskModal', () => {
  it('Should render modal successfully', async () => {
    render(<AddDpskModal visible={true} setVisible={() => {}} />)

    expect(screen.getByTestId('NetworkForm')).toBeVisible()
  })
})