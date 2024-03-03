import { storiesOf } from '@storybook/react'
import { Space }     from 'antd'

import { MapSolid, PictureSolid, PrinterSolid } from '@acx-ui/icons'

import { EdgeClusterTypeCard } from '..'

export function Basic () {
  return <Space>
    <EdgeClusterTypeCard
      id='test'
      title='LAG, Port & Virtual IP Settings'
      icon={<MapSolid/>}
      showSelected={true}
    />
    <EdgeClusterTypeCard
      id='test'
      title='Sub-interface Settings'
      icon={<PictureSolid/>}
      showSelected={false}
      // eslint-disable-next-line max-len
      warningTooltip='The node lacks the general IP configurations for the ports to make it operational, and forming a cluster will require the virtual IP.'
    />
    <EdgeClusterTypeCard
      id='test'
      title='Cluster Interface Settings'
      icon={<PrinterSolid/>}
      showSelected={true}
      // eslint-disable-next-line max-len
      warningTooltip='Establishing a cluster will require nodes to choose a cluster interface for communication.'
      onClick={() => alert('click')}
    />
    <EdgeClusterTypeCard
      id='test'
      title='Cluster Interface Settings'
      icon={<PrinterSolid/>}
      showSelected={true}
      disabled={true}
      // eslint-disable-next-line max-len
      warningTooltip='Establishing a cluster will require nodes to choose a cluster interface for communication.'
      onClick={() => alert('click disabled')}
    />
  </Space>
}

storiesOf('EdgeCluster TypeCard', module)
  .add('Basic', Basic)
export {}
