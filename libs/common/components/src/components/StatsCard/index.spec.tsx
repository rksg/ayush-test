import userEvent         from '@testing-library/user-event'
import { defineMessage } from 'react-intl'

import { render, screen } from '@acx-ui/test-utils'

import { StatsCard } from '.'

describe('StatsCard', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<StatsCard type='green' values={[]} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with title', () => {
    const { asFragment } = render(
      <StatsCard type='red' values={[]} title={defineMessage({ defaultMessage: 'Title' })}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with link', async () => {
    const onClick = jest.fn()
    const { asFragment } = render(<StatsCard type='green' values={[]} onClick={onClick} />)
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByText('(More details)'))
    expect(onClick).toBeCalledTimes(1)
  })
  it('should render correctly with title and link', () => {
    const { asFragment } = render(
      <StatsCard type='green'
        values={[]}
        title={defineMessage({ defaultMessage: 'Title' })}
        onClick={() => {}} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with title and link and values', () => {
    const { asFragment } = render(
      <StatsCard type='green'
        values={[{
          title: defineMessage({ defaultMessage: 'Value 1' }),
          value: '10',
          suffix: 'suffix1'
        }]}
        title={defineMessage({ defaultMessage: 'Title' })}
        onClick={() => {}} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with title and link and 2 values and divider', () => {
    const { asFragment } = render(
      <StatsCard type='green'
        values={[{
          title: defineMessage({ defaultMessage: 'Value 1' }),
          value: '10',
          suffix: 'suffix1'
        }, {
          title: defineMessage({ defaultMessage: 'Value 2' }),
          value: '20',
          suffix: 'suffix2'
        }]}
        title={defineMessage({ defaultMessage: 'Title' })}
        onClick={() => {}} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with title and link and isOpen', () => {
    const { asFragment } = render(
      <StatsCard type='green'
        values={[]}
        title={defineMessage({ defaultMessage: 'Title' })}
        isOpen
        onClick={() => {}} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
