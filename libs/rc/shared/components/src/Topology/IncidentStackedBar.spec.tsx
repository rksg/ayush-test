import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import IncidentStackedBar from './IncidentStackedBar'

describe('IncidentStackedBar', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const data = { P1: 0, P2: 0, P3: 2, P4: 0 }
    render(<Provider>
      <IncidentStackedBar
        incidentData={data}
        isLoading={false}
        category='Switch Incidents' />
    </Provider>,{
      route: { params }
    })
  })
})
