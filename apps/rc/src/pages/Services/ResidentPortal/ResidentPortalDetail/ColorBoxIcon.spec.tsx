import {
  render,
  screen
} from '@acx-ui/test-utils'

import ColorBoxIcon from './ColorBoxIcon'

describe('ColorBoxIcon', () => {

  it('should create an icon with the specified color', async () => {

    const color = '#FF0000'

    render(
      <div data-testid='main-component'>
        <ColorBoxIcon style={{ color: color }} />
      </div>
    )

    const element = screen.getByTestId('main-component').querySelector('.anticon')
    expect(element).toHaveStyle({ color: color })
  })

})
