import { render, screen } from '@acx-ui/test-utils'

import { poorAlarmSummary, requireAttentionAlarmSummary } from './__tests__/fixtures'

import { EdgeServiceStatusLight } from '.'

describe('Edge service status light', () => {

  it('should render good status correctly', async () => {
    render(<EdgeServiceStatusLight data={[]} />)

    expect(await screen.findByText('Good')).toBeVisible()
  })

  it('should render require attention status correctly', async () => {
    render(<EdgeServiceStatusLight data={requireAttentionAlarmSummary} />)

    expect(await screen.findByText('Requires Attention')).toBeVisible()
  })

  it('should render poor status correctly', async () => {
    render(<EdgeServiceStatusLight data={poorAlarmSummary} />)

    expect(await screen.findByText('Poor')).toBeVisible()
  })

  it('should render unknown status correctly', async () => {
    render(<EdgeServiceStatusLight />)

    expect(await screen.findByText('Unknown')).toBeVisible()
  })
})