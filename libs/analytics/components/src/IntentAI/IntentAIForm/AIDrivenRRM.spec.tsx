import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { AIDrivenRRM } from './AIDrivenRRM'

describe('AIDrivenRRM form', () => {
  it('should match snapshot', () => {
    render(<Provider>
      <AIDrivenRRM />
    </Provider>, { route: { params: { intentId: 'aiDrivenRRM' } } })
    // TODO
    // furnish test details later when complete implementation done
  })
})
