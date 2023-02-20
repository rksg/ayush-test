/* eslint-disable max-len */

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeData as currentEdge } from '../../__tests__/fixtures'

import { EdgeUpTimeWidget } from './EdgeUpTimeWidget'


describe('Edge UpTimeWidget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }


  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeUpTimeWidget />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Total Uptime:')).toBeTruthy()
  })
})