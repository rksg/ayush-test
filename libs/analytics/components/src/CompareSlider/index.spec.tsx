import { render, screen } from '@acx-ui/test-utils'

import { ComponentOne, ComponentTwo } from './stories/CustomComponents'

import { CompareSlider } from './index'

// react-compare-slider requires @types/node to be 20.11.16, but we only have 16.11.7 so we need to mock ResizeObserver
class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

describe('CompareSlider', () => {
  window.ResizeObserver = ResizeObserver
  it('should render CompareSlider component', () => {
    render(
      <CompareSlider
        itemOne={<ComponentOne />}
        itemTwo={<ComponentTwo />}
      />)

    expect(screen.getByTestId('custom-component-one')).toBeVisible()
    expect(screen.getByAltText('ImageOne')).toBeVisible()

    expect(screen.getByTestId('custom-component-two')).toBeVisible()
    expect(screen.getByAltText('ImageTwo')).toBeVisible()
  })

})
