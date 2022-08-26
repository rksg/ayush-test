import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { render, screen }    from '@acx-ui/test-utils'

import WifiWidgets from './Widgets'

describe('Wi-Fi Widgets', () => {
  it('should render a Card with name', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(<WifiWidgets name={'none'}></WifiWidgets>)
    expect(screen.getByText('none')).toBeTruthy()
  })
})
