import { useContext } from 'react'

import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Alert }      from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EditEdgeDataContext } from './EditEdgeDataProvider'

export const ClusterNavigateWarning = (props: { warningMsgDescriptor?: MessageDescriptor }) => {
  const { $t } = useIntl()
  const { warningMsgDescriptor } = props
  const { clusterInfo } = useContext(EditEdgeDataContext)

  const defaultWarningMsgDescriptor = defineMessage({ defaultMessage:
     `This node has already been a part of the cluster.
    Please go to “{redirectLink}” to modify the configurations
    for all nodes in this cluster ({clusterName})`
  })

  const warningMsg = <>
    {$t(warningMsgDescriptor || defaultWarningMsgDescriptor ,
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