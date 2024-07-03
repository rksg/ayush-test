import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { AIDrivenRRM } from './AIDrivenRRM'

describe('AIDrivenRRM form', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Provider>
      <AIDrivenRRM />
    </Provider>, { route: { params: { intentId: 'aiDrivenRRM' } } })
    expect(asFragment()).toMatchSnapshot()
  })
})
