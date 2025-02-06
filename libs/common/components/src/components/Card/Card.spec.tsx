import { render, screen, act } from '@acx-ui/test-utils'

import { Card } from '.'

describe('Card component', () => {
  it('should render card with title', () => {
    render(<Card title='title'/>)
    expect(screen.getByText('title')).toBeVisible()
  })
  it('should render card with title and icons', () => {
    render(
      <Card
        cardIcon={<>card icon</>}
        title={{ title: 'title', icon: <>icon</> }}
      />)
    expect(screen.getByText('title')).toBeVisible()
    expect(screen.getByText('card icon')).toBeVisible()
    expect(screen.getByText('icon')).toBeVisible()
  })
  it('should render card with subtitle', () => {
    render(<Card title='title' subTitle='sub title' />)
    expect(screen.getByText('sub title')).toBeVisible()
  })
  it('should render card with buttons', () => {
    const onArrowClick = jest.fn()
    const onMoreClick = jest.fn()
    render(<Card onArrowClick={onArrowClick} onMoreClick={onMoreClick}/>)
    expect(onArrowClick).toBeCalledTimes(0)
    expect(onMoreClick).toBeCalledTimes(0)
    act(() => screen.getByTitle('Expand').click())
    act(() => screen.getByTitle('More').click())
    expect(onArrowClick).toBeCalledTimes(1)
    expect(onMoreClick).toBeCalledTimes(1)
  })
  it('should render card with action link', () => {
    const onActionClick = jest.fn()
    render(<Card action={{
      actionName: 'Details',
      onActionClick: onActionClick
    }}/>)
    expect(onActionClick).toBeCalledTimes(0)
    act(() => screen.getByText('Details').click())
    expect(onActionClick).toBeCalledTimes(1)
  })
  it('should render card with no border', () => {
    const { asFragment } = render(<Card type='no-border'>test</Card>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render card with grey background', () => {
    const { asFragment } = render(<Card type='solid-bg'>test</Card>)
    expect(asFragment()).toMatchSnapshot()
  })
})
