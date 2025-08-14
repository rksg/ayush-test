import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntPortTab } from '.'

jest.mock('../OntPortTable', () => ({
  OntPortTable: () => <div>OntPortTable</div>
}))

describe('OntPortTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', async () => {
    render(<Provider>
      <OntPortTab />
    </Provider>, { route: { params } })

    expect(screen.getByText('OntPortTable')).toBeInTheDocument()
  })

})
