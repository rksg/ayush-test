import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { SLAConfig } from './config'
import SLAStepSlider from './SLAStepSlider'

const mockSlaConfig: SLAConfig = {
  splits: [20, 40, 80, 160, 320],
  defaultValue: 20,
  formatter: (value: number) => value,
  units: { defaultMessage: 'Mbps' },
  title: { defaultMessage: 'Channel Width' },
  apiMetric: 'channelWidthExperience'
}

const mockOnChange = jest.fn()

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: () => '',
    $t: jest.fn((message) => message?.defaultMessage || '')
  })
}))

describe('SLAStepSlider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders slider with correct title and units', () => {
    render(
      <SLAStepSlider
        slaConfig={mockSlaConfig}
        sliderValue={0}
        splits={mockSlaConfig.splits!}
        onSliderChange={mockOnChange}
      />
    )

    expect(screen.getByText('Channel Width (Mbps)')).toBeVisible()
  })

  it('renders slider marks with formatted values', () => {
    render(
      <SLAStepSlider
        slaConfig={mockSlaConfig}
        sliderValue={0}
        splits={mockSlaConfig.splits!}
        onSliderChange={mockOnChange}
      />
    )

    mockSlaConfig.splits?.forEach(value => {
      expect(screen.getByText(value.toString())).toBeVisible()
    })
  })

  it('calls onSliderChange when value changes', () => {
    render(
      <SLAStepSlider
        slaConfig={mockSlaConfig}
        sliderValue={0}
        splits={mockSlaConfig.splits!}
        onSliderChange={mockOnChange}
      />
    )

    const sliderMarkText = screen.getByText('40')
    fireEvent.click(sliderMarkText)

    expect(mockOnChange).toHaveBeenCalledWith(1)
  })

  it('renders slider without units when not provided', () => {
    const configWithoutUnits = {
      ...mockSlaConfig,
      units: undefined
    }

    render(
      <SLAStepSlider
        slaConfig={configWithoutUnits}
        sliderValue={0}
        splits={mockSlaConfig.splits!}
        onSliderChange={mockOnChange}
      />
    )

    expect(screen.getByText('Channel Width')).toBeVisible()
    expect(screen.queryByText('Channel Width (Mbps)')).not.toBeInTheDocument()
  })

  it('handles custom formatter', () => {
    const configWithCustomFormatter = {
      ...mockSlaConfig,
      formatter: (value: number) => value / 1000
    }

    render(
      <SLAStepSlider
        slaConfig={configWithCustomFormatter}
        sliderValue={0}
        splits={mockSlaConfig.splits!}
        onSliderChange={mockOnChange}
      />
    )

    mockSlaConfig.splits?.forEach(value => {
      expect(screen.getByText((value / 1000).toString())).toBeVisible()
    })
  })
})
