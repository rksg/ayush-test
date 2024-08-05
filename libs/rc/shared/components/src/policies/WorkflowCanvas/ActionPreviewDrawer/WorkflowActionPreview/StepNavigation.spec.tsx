import React from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { StepNavigation } from './StepNavigation'


describe('StepNavigation', () => {
  it('should render navigation with Back/Next buttons correctly', async () => {
    const onBackFn = jest.fn()
    const onNextFn = jest.fn()

    render(<StepNavigation
      onBack={onBackFn}
      onNext={onNextFn}
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
    />)

    await userEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(onStartFn).toHaveBeenCalled()
  })
})
