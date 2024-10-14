import React from 'react'

import userEvent from '@testing-library/user-event'

import { UIColorSchema }  from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import { StepNavigation } from './StepNavigation'

const config:UIColorSchema = {
  fontHeaderColor: 'var(--acx-neutrals-100)',
  backgroundColor: 'var(--acx-primary-white)',
  fontColor: 'var(--acx-neutrals-100)',

  buttonFontColor: 'var(--acx-primary-white)',
  buttonColor: 'var(--acx-accents-orange-50)'
}

describe('StepNavigation', () => {
  it('should render navigation with Back/Next buttons correctly', async () => {
    const onBackFn = jest.fn()
    const onNextFn = jest.fn()

    render(<StepNavigation
      onBack={onBackFn}
      onNext={onNextFn}
      config={config}
    />)

    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(onBackFn).toHaveBeenCalled()
    expect(onNextFn).toHaveBeenCalled()
  })

  it('should render navigation correctly when isStart is true', async () => {
    const onStartFn = jest.fn()

    render(<StepNavigation
      isStart={true}
      onNext={onStartFn}
      config={config}
    />)

    await userEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(onStartFn).toHaveBeenCalled()
  })
})
