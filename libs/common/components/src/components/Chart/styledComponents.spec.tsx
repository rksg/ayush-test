import { render } from '@acx-ui/test-utils'

import { ResetButton, TooltipWrapper } from './styledComponents'

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

  describe('TooltipWrapper', () => {
    it('renders with different max width', () => {
      const { asFragment: asFragmentLegend } = render(<TooltipWrapper
        maxWidth={300}
      />)
      expect(asFragmentLegend().firstChild).toHaveStyle('max-width: 300px')
    })
    it('renders with default max width', () => {
      const { asFragment: asFragmentLegend } = render(<TooltipWrapper/>)
      expect(asFragmentLegend().firstChild).toHaveStyle('max-width: 200px')
    })
  })
})
