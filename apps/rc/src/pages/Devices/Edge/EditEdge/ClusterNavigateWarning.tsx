import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Alert }      from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EditEdgeDataContext } from './EditEdgeDataProvider'


export const ClusterNavigateWarning = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(EditEdgeDataContext)

  const warningMsg = <>
    {$t(
      { defaultMessage: `This node has already been a part of the cluster.
    Please go to “{redirectLink}” to modify the configurations
    for all nodes in this cluster ({clusterName})` },
      {
        redirectLink: <TenantLink
          to={`/devices/edge/cluster/${clusterInfo?.clusterId}/configure`}
          children={$t({ defaultMessage: 'Cluster & RUCKUS Edge configuration wizard' })}
        />,
        clusterName: clusterInfo?.name
      }
    )}
  </>

  return (
    <Alert message={warningMsg} type='info' showIcon />
  )
}

export const MultiWanClusterNavigateWarning = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(EditEdgeDataContext)

  const warningMsg = <>
    {$t(
      { defaultMessage: `Please go to “{redirectLink}” to modify the configurations
    for all nodes in this cluster ({clusterName})` },
      {
        redirectLink: <TenantLink
          to={`/devices/edge/cluster/${clusterInfo?.clusterId}/configure`}
          children={$t({ defaultMessage: 'Cluster & RUCKUS Edge configuration wizard' })}
        />,
        clusterName: clusterInfo?.name
      }
    )}
  </>

  return (
    <Alert message={warningMsg} type='info' showIcon />
  )
}