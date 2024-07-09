/* eslint-disable max-len */
import { render, screen } from '@acx-ui/test-utils'


import {  ApCompatibilityToolTip } from '.'

describe('ApCompatibilityToolTip', () => {
  it('should visible render correctly', async () => {
    render(<ApCompatibilityToolTip title={'Simple tooltip'} visible={true} onClick={() => {}} />)
    const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(icon).toBeVisible()
  })

  it('should invisible render correctly', async () => {
    render(<ApCompatibilityToolTip title={'Simple tooltip'} visible={false} onClick={() => {}} />)
    expect(screen.queryByTestId('tooltip-button')).toBeNull()
  })

})
