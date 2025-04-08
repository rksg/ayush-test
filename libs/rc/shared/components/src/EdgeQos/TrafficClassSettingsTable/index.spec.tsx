
import {
  EdgeHqosProfileFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { TrafficClassSettingsTable } from '.'


const { mockTrafficClassSettings } = EdgeHqosProfileFixtures

describe('Edge Qos Bandwidth TrafficClassSettgins Table', () => {
  it('should correctly render', async () => {
    render(
      <Provider>
        <TrafficClassSettingsTable
          trafficClassSettings={mockTrafficClassSettings}
        />
      </Provider>)
    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(1+ mockTrafficClassSettings.length)
    const columnheaders = await screen.findAllByRole('columnheader')
    expect(columnheaders.length).toBe(3)
    expect(screen.getByRole('columnheader', { name: 'Class' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Guaranteed BW' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Max BW' })).toBeTruthy()

    expect(within(rows[1]).getByRole('cell', { name: /Video/i })).toBeVisible()
    expect(within(rows[1]).getByRole('cell', { name: '15%' })).toBeVisible()
  })


})
