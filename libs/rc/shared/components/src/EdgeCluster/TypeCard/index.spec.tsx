import userEvent from '@testing-library/user-event'
import { Radio } from 'antd'

import { MapSolid } from '@acx-ui/icons'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { EdgeClusterTypeCard } from './'

const mockedOnClickFn = jest.fn()
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Spin: ({ children, spinning }: React.PropsWithChildren
  & { spinning: boolean }) => <div>
    {spinning && <div data-testid='antd-spinning' />}
    {children}
  </div>
}))

describe('EdgeClusterTypeCard', () => {
  beforeEach(() => {
    mockedOnClickFn.mockReset()
  })

  it('should correctly display', async () => {
    render(
      <EdgeClusterTypeCard
        id='interface'
        title='Port & Virtual IP'
        icon={<MapSolid />}
      />)

    expect(screen.getByText('Port & Virtual IP')).toBeVisible()
    expect(screen.getByTestId('MapSolid')).toBeVisible()
    expect(screen.queryByTestId('antd-spinning')).toBeNull()
  })

  it('should display warning tooltip', async () => {
    render(
      <EdgeClusterTypeCard
        id='interface'
        title='Port & Virtual IP'
        icon={<MapSolid title='portVirtualIP'/>}
        warningTooltip='A test warning'
      />)
    await userEvent.hover(screen.getByTestId('WarningCircleSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('A test warning')
  })

  it('should display selected icon when selected', async () => {
    render(
      <Radio.Group value='interface'>
        <EdgeClusterTypeCard
          id='interface'
          title='Port & Virtual IP'
          icon={<MapSolid title='portVirtualIP'/>}
        />
      </Radio.Group>)

    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.queryByRole('radio')?.parentNode).toHaveClass('ant-radio-checked')
  })

  it('should invoke click handler', async () => {
    render(
      <EdgeClusterTypeCard
        id='interface'
        title='Port & Virtual IP'
        icon={<MapSolid title='portVirtualIP'/>}
        onClick={mockedOnClickFn}
      />)
    const card = screen.getByText('Port & Virtual IP')
    await userEvent.click(card)
    expect(mockedOnClickFn).toBeCalledTimes(1)
  })

  it('should correctly disabled', async () => {
    render(
      <EdgeClusterTypeCard
        id='interface'
        title='Port & Virtual IP'
        icon={<MapSolid title='portVirtualIP'/>}
        disabled={true}
        onClick={mockedOnClickFn}
      />)
    await userEvent.click(screen.getByText('Port & Virtual IP'))
    expect(mockedOnClickFn).toBeCalledTimes(0)
    expect(screen.getByTestId('antd-spinning')).toBeVisible()
  })
})