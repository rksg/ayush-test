import '@testing-library/jest-dom'
import { AAAServerTypeEnum } from '@acx-ui/rc/utils'
import { Provider }          from '@acx-ui/store'
import { render }            from '@acx-ui/test-utils'

import { AAAServerTable } from './AAAServerTable'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const aaaSetting = {
  authnEnabledSsh: true,
  authnEnableTelnet: false,
  authnFirstPref: AAAServerTypeEnum.RADIUS,
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  id: '3d0e71c087e743feaaf6f6a19ea955f2'
}

describe('AAAServerTable', () => {
  it('should render correctly', async () => {
    const tableQuery = jest.fn()
    const { asFragment } = render(<Provider>
      <AAAServerTable
        type={AAAServerTypeEnum.RADIUS}
        tableQuery={tableQuery}
        aaaSetting={aaaSetting}
      />
    </Provider>
    , { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
