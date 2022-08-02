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
    render(<Card title='title' subTitle='sub title' useFullHeight/>)
    expect(screen.getByText('sub title')).toBeVisible()
  })
  it('should render card with tabs', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'tab - 1',
        component: <div>content1</div>
      },
      {
        value: 'tab2',
        label: 'tab - 2',
        component: <div>content2</div>
      }
    ]
    const onTabChange = jest.fn()
    render(<Card tabs={tabs} defaultTab={'tab1'} onTabChange={onTabChange}/>)
    expect(screen.getByText('content1')).toBeVisible()
    act(() => screen.getByText('tab - 2').click())
    expect(onTabChange).toBeCalledTimes(1)
    expect(screen.getByText('content2')).toBeVisible()
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
})
