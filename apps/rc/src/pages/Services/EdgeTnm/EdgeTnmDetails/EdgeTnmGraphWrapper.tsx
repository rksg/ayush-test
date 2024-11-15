import { useMemo } from 'react'

import { Col, Row } from 'antd'

import { useGetEdgeTnmGraphItemsInfoQuery, useGetEdgeTnmGraphItemsQuery } from '@acx-ui/rc/services'

import { EdgeTnmGraph } from './EdgeTnmGraph'

interface EdgeTnmGraphWrapperProps {
  serviceId: string | undefined
  graphId: string | undefined
}
export const EdgeTnmGraphWrapper = (props: EdgeTnmGraphWrapperProps) => {
  const { serviceId, graphId } = props

  const { data } = useGetEdgeTnmGraphItemsQuery({
    params: { serviceId, graphId }
  }, { skip: !serviceId || !graphId })

  const itemIds = useMemo(() => data?.map(i => i.itemid), [data])

  const { itemNameMap } = useGetEdgeTnmGraphItemsInfoQuery({
    params: { serviceId },
    payload: { ids: itemIds }
  }, {
    skip: !serviceId || !itemIds?.length,
    selectFromResult: ({ data, ...others }) => ({
      itemNameMap: Object.fromEntries(data?.map(item => [item.itemid, item.name]) || []),
      ...others
    })
  })
  return data
    ? (<Row key={data[0].graphid}>
      <Col span={24}>
        <EdgeTnmGraph
          serviceId={serviceId}
          itemIds={itemIds}
          itemNameMap={itemNameMap}
        />
      </Col>
    </Row>
    ) : null
}