import '@testing-library/jest-dom'
import 'jest-styled-components'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { Tooltip } from '.'

describe('Tooltip', () => {
  it('should render correctly', async () => {
    render(<Tooltip title={'This is a tooltip'} children='Some text' />)
    const content = await screen.findByText('Some text')
    expect(content).toBeVisible()
  })

  it('should render dottedUnderline correctly', async () => {
    // eslint-disable-next-line max-len
    render(<Tooltip title={'This is a dottedUnderline tooltip'} dottedUnderline children='Some text' />)
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

  it('renders Tooltip.Warning', async () => {
    render(<Tooltip.Warning title='question tooltip' iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('WarningCircleOutlined')
    expect(icon).toBeVisible()
  })

  it('renders Tooltip.Warning with filled', async () => {
    render(<Tooltip.Warning title='question tooltip' isFilled iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('WarningCircleSolid')
    expect(icon).toBeVisible()
  })

  it('renders Tooltip.Warning filled circle defaults', async () => {
    render(
      <Tooltip.Warning
        title='warning tooltip'
        isFilled
        iconStyle={{ width: '16px' }}
      />
    )
    const icon = await screen.findByTestId('WarningCircleSolid')
    expect(icon).toBeVisible()
    expect(icon).toHaveStyleRule('fill', '#333333', { modifier: 'path:nth-child(1)' })
    expect(icon).toHaveStyleRule('stroke', '#333333', { modifier: 'path:nth-child(2)' })
  })

  it('renders Tooltip.Warning filled circle uses icon color when no borderColor', async () => {
    render(
      <Tooltip.Warning
        title='warning tooltip'
        isFilled
        iconStyle={{ width: '16px', color: '#ff0000' }}
      />
    )
    const icon = await screen.findByTestId('WarningCircleSolid')
    expect(icon).toBeVisible()
    expect(icon).toHaveStyleRule('fill', '#ff0000', { modifier: 'path:nth-child(1)' })
    expect(icon).toHaveStyleRule('stroke', '#ff0000', { modifier: 'path:nth-child(2)' })
  })

  it('renders Tooltip.Warning filled circle uses borderColor for stroke', async () => {
    render(
      <Tooltip.Warning
        title='warning tooltip'
        isFilled
        iconStyle={{ width: '16px', color: '#0000ff', borderColor: '#00ff00' }}
      />
    )
    const icon = await screen.findByTestId('WarningCircleSolid')
    expect(icon).toBeVisible()
    expect(icon).toHaveStyleRule('fill', '#0000ff', { modifier: 'path:nth-child(1)' })
    expect(icon).toHaveStyleRule('stroke', '#00ff00', { modifier: 'path:nth-child(2)' })
  })

  it('renders Tooltip.Warning with triangle', async () => {
    render(<Tooltip.Warning title='question tooltip'
      isTriangle
      iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('WarningTriangleOutlined')
    expect(icon).toBeVisible()
  })

  it('renders Tooltip.Warning with triangle and filled', async () => {
    render(<Tooltip.Warning title='question tooltip'
      isFilled
      isTriangle
      iconStyle={{ width: '16px' }}/>)
    const icon = await screen.findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })
})
