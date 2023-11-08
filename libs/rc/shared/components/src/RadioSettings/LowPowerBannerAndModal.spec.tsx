import { Form } from 'antd'

import { Provider }                              from '@acx-ui/store'
import { fireEvent, render, screen, renderHook } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'
import { ApRadioTypeEnum }        from './RadioSettingsContents'
import { SingleRadioSettings }    from './SingleRadioSettings'

describe('LowPowerBannerAndModal Unit Test', () => {
  it('Test Case for how to fix this button', () => {
    render(<LowPowerBannerAndModal parent='ap' />)
    const howToFixThisButton = screen.getByTestId('how-to-fix-this-button')
    expect(howToFixThisButton).toBeInTheDocument()
    fireEvent.click(howToFixThisButton)
    const instructionModal = screen.getByTestId('instruction-modal')
    expect(instructionModal).toBeInTheDocument()
    const okGotItButton = screen.getByTestId('ok-got-it-button')
    fireEvent.click(okGotItButton)
    expect(screen.queryByTestId('ok-got-it-button')).not.toBeVisible()
  })

  it('Test Case for AP Banner display', async () => {
    render(<LowPowerBannerAndModal parent='ap' />)
    expect(await screen.findByText('Degraded - AP in low power mode')).toBeInTheDocument()
  })

})
