import { render, screen } from '@acx-ui/test-utils'

import { Legend } from './Legend'

describe('Legend', () => {
  const mockStyle = {
    legend1: {
      color: '#FF0000',
      legendText: {
        id: 'legend-1',
        defaultMessage: 'Legend 1'
      },
      tooltip: null
    },
    legend2: {
      color: '#00FF00',
      legendText: {
        id: 'legend-2',
        defaultMessage: 'Legend 2'
      },
      tooltip: {
        id: 'tooltip-2',
        defaultMessage: 'Tooltip 2'
      }
    }
  }

  const renderComponent = (style = mockStyle) => {
    return render(<Legend {...style} />)
  }

  it('should render properly', async () => {
    const { asFragment } = renderComponent()
    expect(screen.getByText('Legend 1')).toBeInTheDocument()
    expect(screen.getByText('Legend 2')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })
})
