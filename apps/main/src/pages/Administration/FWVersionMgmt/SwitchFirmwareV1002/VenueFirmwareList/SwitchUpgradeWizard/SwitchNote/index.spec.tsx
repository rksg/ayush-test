import { Form } from 'antd'

import { SwitchFirmwareV1002 } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  icx8200AvGroupedData
} from '../../__test__/fixtures'

import { NotesEnum, SwitchNote } from '.'


describe('SwitchNote', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('render SwitchNote', async () => {
    render(
      <Provider>
        <Form>
          <SwitchNote
            type={NotesEnum.NOTE8200_1}
            data={icx8200AvGroupedData as SwitchFirmwareV1002[][]}
          />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    expect(screen.getByText(/10.0.10f/i)).toBeInTheDocument()
  })
})
