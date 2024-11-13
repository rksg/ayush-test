import { Col, Row } from 'antd'

import {
  Loader } from '@acx-ui/components'
import { useGetEdgeTnmHostGraphsConfigQuery } from '@acx-ui/rc/services'

import { EdgeTnmGraphWrapper } from './EdgeTnmGraphWrapper'

interface EdgeTnmHostGraphListProps {
  serviceId: string | undefined
  hostId: string | undefined
}
export const EdgeTnmHostGraphList = (props: EdgeTnmHostGraphListProps) => {
  const { serviceId, hostId } = props

  const { data, isLoading, isFetching } = useGetEdgeTnmHostGraphsConfigQuery({
    params: { serviceId, hostId }
  }, { skip: !serviceId || !hostId })

  return <Loader states={[{ isLoading, isFetching }]}
    style={{ backgroundColor: 'transparent', minHeight: 250 }}
  >
    {data?.map((item) => {
      return <Row key={item.graphid}>
        <Col span={24}>
          <EdgeTnmGraphWrapper
            serviceId={serviceId}
            graphId={item.graphid}
          />
        </Col>
      </Row>
    })}
  </Loader>
}