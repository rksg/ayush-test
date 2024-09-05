import { Form } from 'antd'

import { SwitchFirmwareV1002 } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  icx7150C08pGroupedData
} from '../../__test__/fixtures'

import { NotesEnum, SwitchNote } from '.'


describe('SwitchNote', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('render SwitchNote', async () => {
    render(
      <Provider>
        <Form>
          <SwitchNote
            notes={[{
              type: NotesEnum.NOTE7150_1,
              data: icx7150C08pGroupedData as SwitchFirmwareV1002[][]
            }]} />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    expect(screen.getByText(/09.0.10x/i)).toBeInTheDocument()
  })


})
