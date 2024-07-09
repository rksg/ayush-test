import { NodeClusterRoleEnum } from '@acx-ui/rc/utils'
import { render, screen }      from '@acx-ui/test-utils'

import { HaStatusBadge } from './HaStatusBadge'

describe('Edge Cluster - HaStatusBadge', () => {

  it('should render active status correctly', async () => {
    render(
      <HaStatusBadge
        haStatus={NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE}
      />
    )
    expect(screen.getByText('Active')).toBeVisible()
  })

  it('should render bakup status correctly', async () => {
    render(
      <HaStatusBadge
        haStatus={NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP}
      />
    )
    expect(screen.getByText('Standby')).toBeVisible()
  })

  it('should render unrecognized status correctly', async () => {
    render(
      <HaStatusBadge
        haStatus={'test'}
      />
    )
    expect(screen.getByText('N/A')).toBeVisible()
  })
})