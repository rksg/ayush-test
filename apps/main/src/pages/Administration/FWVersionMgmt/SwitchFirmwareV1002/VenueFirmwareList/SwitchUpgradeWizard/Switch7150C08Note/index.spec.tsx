import { Form } from 'antd'

import { SwitchFirmwareV1002 } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  icx7150C08pGroupedData
} from '../../__test__/fixtures'

import { Switch7150C08Note } from '.'


describe('ScheduleStep', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('render ScheduleStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <Switch7150C08Note
            icx7150C08pGroupedData={icx7150C08pGroupedData as SwitchFirmwareV1002[][]} />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    expect(screen.getByText(/09.0.10x/i)).toBeInTheDocument()
  })


})
