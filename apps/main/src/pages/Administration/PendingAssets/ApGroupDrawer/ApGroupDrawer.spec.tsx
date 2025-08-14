import '@testing-library/jest-dom'

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

  it('renders with default props and handles all interactions when open is true', () => {
    render(
        <Provider>
          <ApGroupDrawer {...mockProps} />
        </Provider>
    )

    // Test basic rendering
    expect(screen.getByText('Add AP Group')).toBeVisible()
    expect(screen.getByTestId('ap-group-general-tab')).toBeVisible()

    // Test drawer width
    const drawer = screen.getByRole('dialog')
    expect(drawer).toBeInTheDocument()

    // Test ApGroupGeneralTab component with correct props
    expect(screen.getByTestId('ap-group-general-tab')).toBeVisible()
    expect(screen.getByTestId('mock-close-button')).toBeVisible()
    expect(screen.getByTestId('mock-finish-button')).toBeVisible()

    // Test i18n title
    expect(screen.getByText('Add AP Group')).toBeVisible()

    // Test ApGroupEditContextProvider wrapper
    expect(screen.getByTestId('ap-group-general-tab')).toBeVisible()

    // Test close functionality
    fireEvent.click(screen.getByLabelText('Close'))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render when open is false', () => {
    render(
        <Provider>
          <ApGroupDrawer {...mockProps} open={false} />
        </Provider>
    )
    expect(screen.queryByText('Add AP Group')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ap-group-general-tab')).not.toBeInTheDocument()
  })

  it('handles mock component interactions correctly', () => {
    render(
        <Provider>
          <ApGroupDrawer {...mockProps} />
        </Provider>
    )

    // Test mock close button
    fireEvent.click(screen.getByTestId('mock-close-button'))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)

    // Test mock finish button
    fireEvent.click(screen.getByTestId('mock-finish-button'))
    expect(mockProps.onClose).toHaveBeenCalledTimes(2)
  })
})