import '@testing-library/jest-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { AssocVenueDrawer, AssocVenueDrawerProps } from './AssocVenueDrawer'

const mockProps = {
  visible: true,
  setVisible: jest.fn(),
  usedVenueIds: []
} as unknown as AssocVenueDrawerProps

describe('AssocVenueDrawer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    render(
      <Provider>
        <AssocVenueDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Associated Venues')).toBeVisible()
  })

  it('closes drawer when cancel button is clicked', async () => {
    render(
      <Provider>
        <AssocVenueDrawer {...mockProps} />
      </Provider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.setVisible).toHaveBeenCalledTimes(1)
  })

})
