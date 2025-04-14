
import { render, screen } from '@acx-ui/test-utils'

import { mockKpiResultData } from '../__tests__/mockedEcoFlex'

import { RenderDonutChart } from './Introduction'

describe('introduction', () => {
  it('should render DonutChart\'s titles in compareSlider when it has data', async () => {
    render(<RenderDonutChart data={mockKpiResultData.compareData.data} titleColor='black' />)
    expect(screen.queryByText(/supporting and enabling Energy Saving/)).toBeVisible()
  })

  it('should not render DonutChart\'s titles in compareSlider when it has empty data', async () => {
    render(<RenderDonutChart data={[]} titleColor='black' />)
    expect(screen.queryByText(/supporting and enabling Energy Saving/)).toBeNull()
  })
})
