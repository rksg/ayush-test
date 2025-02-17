import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import CustomizeWidgetDrawer, { CustomizeWidgetDrawerProps } from './CustomizeWidgetDrawer'

const mockWidget = {
  id: 'widget-id',
  name: 'Widget Name',
  chartOption: [],
  chartType: '',
  chatId: '',
  sessionId: ''
}

const mockProps = {
  canvasId: 'canvas-id',
  widget: mockWidget,
  visible: true,
  setVisible: jest.fn()
} as unknown as CustomizeWidgetDrawerProps

const mockedUpdate = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  useUpdateWidgetMutation: () => [mockedUpdate]
}))

describe('CustomizeWidgetDrawer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Customize Widget')).toBeInTheDocument()
    expect(screen.getByLabelText('Widget Title')).toBeInTheDocument()
  })

  it('closes drawer when cancel button is clicked', async () => {
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('submits form with updated widget name', async () => {
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )

    const input = screen.getByLabelText('Widget Title')
    await userEvent.clear(input)
    await userEvent.type(input, 'New Widget Name')

    fireEvent.click(screen.getByText('OK'))

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith({
        params: { canvasId: 'canvas-id', widgetId: 'widget-id' },
        payload: { name: 'New Widget Name' }
      })
    })

    expect(mockProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('validates form and shows error message', async () => {
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )

    const input = screen.getByLabelText('Widget Title')
    await userEvent.clear(input)

    fireEvent.click(screen.getByText('OK'))

    await waitFor(() => {
      expect(screen.getByText('Please enter Widget Title')).toBeInTheDocument()
    })
  })

  it('does not render when visible is false', async () => {
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} visible={false} />
      </Provider>
    )
    expect(screen.queryByText('Customize Widget')).not.toBeInTheDocument()
  })
})
