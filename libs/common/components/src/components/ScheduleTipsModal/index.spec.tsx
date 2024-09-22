
import React from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { BasicTipsModal } from './stories'

describe('ScheduleTipsModal', () => {
  it('should render correct', async () => {
    render(<BasicTipsModal />)
    userEvent.click(await screen.findByText('Open'))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can set custom schedule using the following options')).toBeVisible()
    userEvent.click(await screen.findByText('Open'))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You can set custom schedule using the following options')).not.toBeVisible()
  })
})