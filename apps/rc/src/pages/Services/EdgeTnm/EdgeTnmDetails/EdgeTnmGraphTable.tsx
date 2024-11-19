import { useEffect, useState } from 'react'

import { Row }     from 'antd'
import { find }    from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  Button } from '@acx-ui/components'
import { useGetEdgeTnmHostGraphsConfigQuery } from '@acx-ui/rc/services'
import {
  EdgeTnmHostGraphConfig,
  edgeTnmGraphTypeName
} from '@acx-ui/rc/utils'

import { EdgeTnmGraphWrapper } from './EdgeTnmGraphWrapper'

interface EdgeTnmHostGraphTableProps {
  serviceId: string | undefined
  hostId: string | undefined
}

export const EdgeTnmHostGraphTable = (props: EdgeTnmHostGraphTableProps) => {
  const { serviceId, hostId } = props
  const [currentGraph, setCurrentGraph] = useState<string | undefined>(undefined)
  const { data, isLoading, isFetching } = useGetEdgeTnmHostGraphsConfigQuery({
    params: { serviceId, hostId }
  }, { skip: !serviceId || !hostId })

  useEffect(() => {
    setCurrentGraph(undefined)
  }, [hostId])

  return <Loader states={[{ isLoading, isFetching }]}>
    <Table
      rowKey='graphid'
      columns={useColumns(setCurrentGraph)}
      dataSource={data}
      pagination={{
        defaultPageSize: 5,
        pageSize: 5
      }}
    />
    {currentGraph && (
      <EdgeTnmGraphWrapper
        serviceId={serviceId}
        graphId={currentGraph}
        graphName={find(data, { graphid: currentGraph })?.name}
      />
    )}
  </Loader>
}

function useColumns (setCurrentGraph: (graphid: string) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeTnmHostGraphConfig>['columns'] = [
    {
      title: $t({ defaultMessage: 'Graph Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      width: 200,
      render: (_, row) => {
        return <Button type='link'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentGraph(row.graphid)
          }}
        >
          {row.name}
        </Button>
      }
    },
    {
      title: $t({ defaultMessage: 'Graph Type' }),
      key: 'type',
      dataIndex: 'type',
      align: 'center',
      sorter: true,
      width: 50,
      render: (_, row) => edgeTnmGraphTypeName[row.graphtype]
        ? $t(edgeTnmGraphTypeName[row.graphtype])
        : ''
    },
    {
      title: $t({ defaultMessage: 'Width' }),
      key: 'width',
      dataIndex: 'width',
      width: 50,
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          {row.width}
        </Row>
    },
    {
      title: $t({ defaultMessage: 'Height' }),
      key: 'height',
      dataIndex: 'height',
      width: 50,
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          {row.height}
        </Row>
    }
  ]

  return columns
}