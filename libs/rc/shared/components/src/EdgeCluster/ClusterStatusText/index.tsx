import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Tooltip }                                                            from '@acx-ui/components'
import { ClusterNodeStatusEnum, ClusterStatusEnum, EdgeClusterTableDataType } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const EdgeClusterStatusLabel = (props: Pick<EdgeClusterTableDataType, 'edgeList' | 'clusterStatus'>) => {
  const { $t } = useIntl()
  const { edgeList, clusterStatus } = props

  if((edgeList?.length ?? 0) < 2){
    return <Row align='middle' gutter={[2, 0]}>
      <Col>
        <span>{$t({ defaultMessage: 'Single Node' })}</span>
      </Col>
      <Col>
        <Tooltip.Question
          title={$t({ defaultMessage: `The cluster function requires
        at least two nodes to operate` })}
          placement='bottom'
          iconStyle={{ width: 13, height: 13, marginTop: 3 }}
        />
      </Col>
    </Row>
  }

  let defaultMessage: string
  switch(clusterStatus) {
    case ClusterStatusEnum.CLUSTER_IS_FORMING:
      defaultMessage = $t({ defaultMessage: 'Cluster Forming' })
      break
    case ClusterStatusEnum.CLUSTER_READY:
      defaultMessage = $t({ defaultMessage: 'Ready ({ready}/{total})' }, {
        ready: edgeList?.filter(item =>
          item.clusterNodeStatus === ClusterNodeStatusEnum.CLUSTER_NODE_READY).length ?? 0,
        total: edgeList?.length ?? 0
      })
      break
    case ClusterStatusEnum.CLUSTER_UNHEALTHY:
      defaultMessage = $t({ defaultMessage: 'Disconnected' })
      break
    case ClusterStatusEnum.CLUSTER_CONFIGS_NEEDED:
    default:
      defaultMessage = $t({ defaultMessage: 'Cluster Setup Required' })
      break
  }

  return <span>{defaultMessage}</span>
}