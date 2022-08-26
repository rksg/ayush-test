import { render, screen, act } from '@testing-library/react'

import { Card } from '.'

jest.mock('@acx-ui/icons', () => ({
  ArrowsOut: () => <svg></svg>,
  MoreVertical: () => <svg></svg>
}))
describe('Card component', () => {
  it('should render card with title', () => {
    render(<Card title='title'/>)
    expect(screen.getByText('title')).toBeVisible()
  })
  it('should render card with subtitle', () => {
    render(<Card title='title' subTitle='sub title' />)
    expect(screen.getByText('sub title')).toBeVisible()
  })
  it('should render card with buttons', () => {
    const onExpandClick = jest.fn()
    const onMoreClick = jest.fn()
    render(<Card onExpandClick={onExpandClick} onMoreClick={onMoreClick}/>)
    expect(onExpandClick).toBeCalledTimes(0)
    expect(onMoreClick).toBeCalledTimes(0)
    act(() => screen.getByTitle('Expand').click())
    act(() => screen.getByTitle('More').click())
    expect(onExpandClick).toBeCalledTimes(1)
    expect(onMoreClick).toBeCalledTimes(1)
  })
  it('should render card with no border', () => {
    const { asFragment } = render(<Card bordered={false}>test</Card>)
    expect(asFragment()).toMatchSnapshot()
  })
})
