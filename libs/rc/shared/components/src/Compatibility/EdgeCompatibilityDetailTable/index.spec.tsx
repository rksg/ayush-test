import {
  EdgeCompatibilityFixtures
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { EdgeCompatibilityDetailTable } from '.'

const { mockEdgeCompatibilitiesVenue } = EdgeCompatibilityFixtures

describe('EdgeCompatibilityDetailTable', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    expect(screen.getByRole('columnheader', { name: 'Incompatible SmartEdges' })).toBeVisible()

    screen.getByRole('row', { name: /SD-LAN 1 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2 2.1.0.400/i })
  })

  it('should not have incompatible count when requirementOnly', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          requirementOnly
        />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    expect(screen.queryByRole('columnheader', { name: 'Incompatible SmartEdges' })).toBeNull()

    screen.getByRole('row', { name: /SD-LAN 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2.1.0.400/i })
  })
})

const basicCheck= async () => {
  const rows = await screen.findAllByRole('row')
  expect(rows.length).toBe(3) // including header
  return rows
}