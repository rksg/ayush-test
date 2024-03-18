
import { render, screen } from '@acx-ui/test-utils'
import { TimelineStatus } from '@acx-ui/types'

import { StatusIcon } from '.'

describe('StatusIcon', () => {

  const status = ['SUCCESS', 'PENDING', 'INPROGRESS', 'FAIL'] as TimelineStatus[]
  it('render SUCCESS StatusIcon', async () => {
    const { asFragment } = render(<StatusIcon status={status[0]}/>)
    const icon = await screen.findByTestId('CheckMarkCircleSolid')
    expect(icon).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('render PENDING StatusIcon', async () => {
    const { asFragment } = render(<StatusIcon status={status[1]}/>)
    const icon = await screen.findByTestId('Pending')
    expect(icon).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('render INPROGRESS StatusIcon', async () => {
    const { asFragment } = render(<StatusIcon status={status[2]}/>)
    const icon = await screen.findByTestId('InProgress')
    expect(icon).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('render FAIL StatusIcon', async () => {
    const { asFragment } = render(<StatusIcon status={status[3]}/>)
    const icon = await screen.findByTestId('CancelCircleSolid')
    expect(icon).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

})
