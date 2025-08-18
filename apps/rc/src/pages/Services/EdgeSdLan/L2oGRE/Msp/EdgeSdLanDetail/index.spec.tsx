import { render, screen } from '@acx-ui/test-utils'

import { EdgeSdLanDetail } from '.'

describe('EdgeSdLanDetail - MSP', () => {
  it('should render', () => {
    render(<EdgeSdLanDetail />)

    expect(screen.getByText('EdgeSdLanDetail')).toBeVisible()
  })
})