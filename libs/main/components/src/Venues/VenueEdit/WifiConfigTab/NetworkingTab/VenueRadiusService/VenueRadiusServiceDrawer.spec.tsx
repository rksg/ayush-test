import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueRadiusServiceDrawer } from './VenueRadiusServiceDrawer'


jest.mock('@acx-ui/rc/components', () => ({
  AAAForm: () => <div>AAAForm</div>
}))

describe('VenueRadiusServiceDrawer', () => {
  it('should render the component correctly', async () => {
    const closeSpy = jest.fn()
    render(
      <VenueRadiusServiceDrawer
        visible={true}
        type='authentication'
        onClose={closeSpy}
        updateInstance={() => {}}
      />
    )
    expect(screen.getByText('AAAForm')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(closeSpy).toHaveBeenCalled()
  })
})
