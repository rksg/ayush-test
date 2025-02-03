import { render, screen } from '@acx-ui/test-utils'

import { mockApModelFamilies } from '../../../Ap/ApCompatibilityDrawer/__test__/fixtures'

import { ApModelFamiliesItem } from '.'


describe('ApModelFamiliesItem', () => {
  it('should render correctly', async () => {
    const models = [ 'R770', 'H670', 'R760', 'R560' ]
    render(
      <ApModelFamiliesItem
        apModelFamilies={mockApModelFamilies}
        models={models} />
    )
    expect(await screen.findByText('Wi-Fi 7')).toBeInTheDocument()
    expect(await screen.findByText('Wi-Fi 6E')).toBeInTheDocument()

  })
})