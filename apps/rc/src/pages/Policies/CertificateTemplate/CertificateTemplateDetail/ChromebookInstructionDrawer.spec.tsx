import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import ChromebookInstructionDrawer from './ChromebookInstructionDrawer'

describe('ChromebookInstructionDrawer', () => {
  it('should render form successfully', async () => {
    render(
      <Provider>
        <ChromebookInstructionDrawer
          // visible={true}
          // setVisible={jest.fn()}
          // isEdit={false}
          // editAttribute={undefined}
          // setAttributeAssignments={jest.fn()}
          // getAttributeAssignments={jest.fn()}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/t/:policyId' }
      }
    )
  })
})
