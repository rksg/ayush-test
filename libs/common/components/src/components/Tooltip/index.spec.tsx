import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Tooltip } from '.'

describe('Tooltip', () => {
  it('should render correctly', async () => {
    render(<Tooltip title={'This is a tooltip'} children='Some text' />)
    const content = await screen.findByText('Some text')
    expect(content).toBeVisible()
  })

  it('renders Tooltip.Question', async () => {
    render(<Tooltip.Question title='question tooltip' />)
    const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(icon).toBeVisible()
  })
})
