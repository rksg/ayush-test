import { useState } from 'react'

import { Col, Radio, RadioChangeEvent, Row } from 'antd'

import {
  Port as PortIcon,
  SubInterface as SubInterfaceIcon,
  ClusterInterface as ClusterInterfaceIcon
} from '@acx-ui/icons'

import { EdgeClusterTypeCard } from '..'

export function TypeCard () {
  const [selected, setSelected] = useState(undefined)
  const onChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }
  return <Radio.Group
    style={{ width: '100%' }}
    onChange={onChange}
    value={selected}
  >
    <Row gutter={[10, 0]}>
      <Col>
        <EdgeClusterTypeCard
          id='test1'
          title='LAG, Port & Virtual IP Settings'
          icon={<PortIcon />}
        />
      </Col>
      <Col>
        <EdgeClusterTypeCard
          id='test2'
          title='Sub-interface Settings'
          icon={<SubInterfaceIcon/>}
          // eslint-disable-next-line max-len
          warningTooltip='The node lacks the general IP configurations for the ports to make it operational, and forming a cluster will require the virtual IP.'
        />
      </Col>
      <Col>
        <EdgeClusterTypeCard
          id='test3'
          title='Cluster Interface Settings'
          icon={<ClusterInterfaceIcon/>}
          // eslint-disable-next-line max-len
          warningTooltip='Establishing a cluster will require nodes to choose a cluster interface for communication.'
          onClick={() => alert('click')}
        />
      </Col>
      <Col>
        <EdgeClusterTypeCard
          id='test4'
          title='Sub-interface Settings'
          icon={<SubInterfaceIcon/>}
          disabled={true}
          // eslint-disable-next-line max-len
          warningTooltip='Establishing a cluster will require nodes to choose a cluster interface for communication.'
          onClick={() => alert('click disabled')}
        />
      </Col>
    </Row>
  </Radio.Group>
}