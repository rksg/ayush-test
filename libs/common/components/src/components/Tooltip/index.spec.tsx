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
    render(<Tooltip.Question title='question tooltip' iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(icon).toBeVisible()
  })

  it('renders Tooltip.Info', async () => {
    render(<Tooltip.Info title='info tooltip' iconStyle={{ width: '24px' }}/>)
    const icon = await screen.findByTestId('InformationOutlined')
    expect(icon).toBeVisible()
  })

  it('renders Tooltip.InfoFilled', async () => {
    render(<Tooltip.Info title='info filled tooltip' isFilled iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('InformationSolid')
    expect(icon).toBeVisible()
  })
})
