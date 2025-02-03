import { screen, render } from '@acx-ui/test-utils'

import { EdgeNokiaOnuPortTable } from './'

describe('EdgeNokiaOnuPortTable', () => {
  it('renders with valid props', () => {
    const props = {
      data: [
        { portId: '1', status: 'active', vlan: ['1', '2'] },
        { portId: '2', status: 'inactive', vlan: ['6'] }
      ]
    }
    render(<EdgeNokiaOnuPortTable {...props} />)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders with empty data', () => {
    const props = {
      data: []
    }
    render(<EdgeNokiaOnuPortTable {...props} />)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })
})