import { render } from '@acx-ui/test-utils'

import { ResetButton } from './styledComponents'

describe('Chart styledComponents', () => {
  describe('ResetButton', () => {
    it('renders with different top value based on disableLegend', () => {
      const { asFragment: asFragmentLegend } = render(<ResetButton
        children={'Reset Zoom'}
        $disableLegend={false}
      />)
      expect(asFragmentLegend().firstChild).toHaveStyle('top: 15%')
      const { asFragment: asFragmentNoLegend } = render(<ResetButton
        children={'Reset Zoom'}
        $disableLegend={true}
      />)
      expect(asFragmentNoLegend().firstChild).toHaveStyle('top: 6px')
    })
  })
})
