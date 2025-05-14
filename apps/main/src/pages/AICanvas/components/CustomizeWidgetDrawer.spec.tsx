import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import CustomizeWidgetDrawer, { CustomizeWidgetDrawerProps } from './CustomizeWidgetDrawer'

const mockWidget = {
  id: 'widget-id',
  name: 'Widget Name',
  chartOption: [],
  chartType: '',
  chatId: '',
  sessionId: '',
  defaultTimeRange: 'Last 7 days'
}

const mockLegacyWidget = {
  id: 'widget-id',
  name: 'Legacy widget',
  chartOption: [],
  chartType: '',
  chatId: '',
  sessionId: ''
}

const mockProps = {
  canvasId: 'canvas-id',
  widget: mockWidget,
  visible: true,
  setVisible: jest.fn(),
  changeWidgetProperty: jest.fn()
} as unknown as CustomizeWidgetDrawerProps

const mockLegacyProps = {
  canvasId: 'canvas-id-legacy',
  widget: mockLegacyWidget,
  visible: false,
  setVisible: jest.fn(),
  changeWidgetProperty: jest.fn()
} as unknown as CustomizeWidgetDrawerProps

const mockedUpdate = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue({})
}))

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

  it('render time range if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Time Range')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Change'))

    await userEvent.click(screen.getByText('Select...'))

    expect(screen.getByText('Reset to default range')).not.toBeVisible()
    expect(screen.getByText('Last 8 Hours')).toBeInTheDocument()
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument()
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Last 30 Days'))
    const resetBtn = await screen.findByText('Reset to default range')
    expect(resetBtn).toBeVisible()
    fireEvent.click(resetBtn)
    expect(await screen.findByText('Last 7 days')).toBeVisible()
  })

  it('render specific time range if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const props = {
      ...mockProps,
      widget: {
        ...mockWidget,
        timeRange: 'HOUR8'
      }
    } as unknown as CustomizeWidgetDrawerProps
    render(
      <Provider>
        <CustomizeWidgetDrawer {...props}/>
      </Provider>
    )
    expect(screen.getByText('Time Range')).toBeVisible()
    expect(screen.getByText('Last 8 Hours')).toBeVisible()
  })

  it('render legacy widget drawer correctly if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockLegacyProps} />
      </Provider>
    )
    expect(screen.queryByText('Time Range')).not.toBeInTheDocument()
  })

  it('no render time range if the feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <CustomizeWidgetDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.queryByText('Time Range')).not.toBeInTheDocument()
  })
})
