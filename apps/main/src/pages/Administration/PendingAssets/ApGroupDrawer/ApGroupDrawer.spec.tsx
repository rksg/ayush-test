import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { ApGroupDrawer } from './ApGroupDrawer'

// Mock ApGroupGeneralTab component
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApGroupGeneralTab: jest.fn(({ handleClose, onFinish }) => (
    <div data-testid='ap-group-general-tab'>
      <button data-testid='mock-close-button' onClick={handleClose}>Mock Close</button>
      <button data-testid='mock-finish-button' onClick={onFinish}>Finish</button>
    </div>
  ))
}))

const mockProps = {
  open: true,
  onClose: jest.fn()
}

describe('ApGroupDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    render(
      <MemoryRouter>
        <Provider>
          <ApGroupDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('Add AP Group')).toBeVisible()
    expect(screen.getByTestId('ap-group-general-tab')).toBeVisible()
  })

  it('closes drawer when close button is clicked', async () => {
    render(
      <MemoryRouter>
        <Provider>
          <ApGroupDrawer {...mockProps} />
        </Provider>
      </MemoryRouter>
    )
    // Use the drawer's close button by its aria-label
    fireEvent.click(screen.getByLabelText('Close'))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })
})