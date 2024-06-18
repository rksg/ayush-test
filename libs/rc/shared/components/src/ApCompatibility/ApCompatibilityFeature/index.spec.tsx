
import { render, screen } from '@acx-ui/test-utils'

import { ApCompatibilityFeature } from '.'

describe('ApCompatibilityFeature', () => {
  it('should Fully compatible render correctly', async () => {
    render(<ApCompatibilityFeature count={0} onClick={() => {}} />)
    const icon = await screen.findByTestId('CheckMarkCircleSolid')
    expect(icon).toBeVisible()
  })

  it('should Partially incompatible render correctly', async () => {
    render(<ApCompatibilityFeature count={2} onClick={() => {}} />)
    const icon = await screen.findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })

  it('should Unknow render correctly', async () => {
    render(<ApCompatibilityFeature onClick={() => {}} />)
    const icon = await screen.findByTestId('Unknown')
    expect(icon).toBeVisible()
  })

})