import { render, screen } from '@acx-ui/test-utils'

import { EdgeSdLanTable } from '.'

describe('EdgeSdLanTable - MSP', () => {
  it('should render', () => {
    render(<EdgeSdLanTable />)

    expect(screen.getByText('EdgeSdLanTable')).toBeVisible()
  })
})