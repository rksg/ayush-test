import userEvent from '@testing-library/user-event'

import { EdgeWanLinkHealthStatusEnum } from '@acx-ui/rc/utils'
import { render, screen }              from '@acx-ui/test-utils'

import { EdgeWanLinkHealthStatusLight } from './index'

describe('EdgeWanLinkHealthStatusLight', () => {
  it('renders with status UP and no targetIpStatus', () => {
    render(
      <EdgeWanLinkHealthStatusLight
        status={EdgeWanLinkHealthStatusEnum.UP}
        targetIpStatus={undefined}
      />
    )
    expect(screen.getByText('Up')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('renders with status DOWN and no targetIpStatus', () => {
    render(
      <EdgeWanLinkHealthStatusLight
        status={EdgeWanLinkHealthStatusEnum.DOWN}
        targetIpStatus={undefined}
      />
    )
    expect(screen.getByText('Down')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('renders with targetIpStatus containing multiple IPs', async () => {
    const targetIpStatus = [
      { ip: '192.168.1.3', status: EdgeWanLinkHealthStatusEnum.UP },
      { ip: '192.168.1.2', status: EdgeWanLinkHealthStatusEnum.DOWN }
    ]

    render(
      <EdgeWanLinkHealthStatusLight
        status={EdgeWanLinkHealthStatusEnum.UP}
        targetIpStatus={targetIpStatus}
      />
    )

    const upText = screen.getByText('Up')
    expect(upText).toBeInTheDocument()
    await userEvent.hover(upText)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(/192.168.1.3 Up/)
    expect(tooltip.textContent).toBe('192.168.1.2  Down192.168.1.3  Up')
  })

  it('renders with empty targetIpStatus array', async () => {
    render(
      <EdgeWanLinkHealthStatusLight
        status={EdgeWanLinkHealthStatusEnum.UP}
        targetIpStatus={[]}
      />
    )
    const upText = screen.getByText('Up')
    expect(upText).toBeInTheDocument()
    await userEvent.hover(upText)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('')
  })
})
