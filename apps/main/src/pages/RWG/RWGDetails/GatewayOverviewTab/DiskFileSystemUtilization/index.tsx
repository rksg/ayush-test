
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { cssStr, Loader, NoActiveContent, Table, TableProps } from '@acx-ui/components'
import { formatter }                                          from '@acx-ui/formatter'
import { useGetGatewayFileSystemsQuery }                      from '@acx-ui/rc/services'
import { GatewayFileSystem }                                  from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'


export default function DiskFileSystemUtilization () {
  const { $t } = useIntl()
  const { tenantId, gatewayId } = useParams()

  const { data: fileSystemData,
    isLoading: isFileSystemDataLoading, isFetching: isFileSystemDataFetching } =
  useGetGatewayFileSystemsQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })

  const bytesFormatter = formatter('bytesFormat')

  const getCapicityWithPercent = function (capacity: string) {
    const capacityNumber = capacity ? Number(capacity.split('%')[0]) : 0
    return capacityNumber
  }

  const getBytesFormat = function (numberInMb: number) {
    return bytesFormatter(numberInMb)
  }

  const columns: TableProps<GatewayFileSystem>['columns'] = [
    {
      title: $t({ defaultMessage: 'Partition' }),
      dataIndex: 'partition',
      key: 'partition',
      render: function (_, row) {
        return row?.partition
      }
    },
    {
      title: $t({ defaultMessage: 'Size' }),
      dataIndex: 'size',
      key: 'size',
      render: function (_, row) {
        return getBytesFormat(row?.size)
      }
    },
    {
      title: $t({ defaultMessage: 'Used' }),
      dataIndex: 'used',
      key: 'used',
      render: function (_, row) {
        return getBytesFormat(row?.used)
      }
    },
    {
      title: $t({ defaultMessage: 'Free' }),
      dataIndex: 'free',
      key: 'free',
      render: function (_, row) {
        return getBytesFormat(row?.free)
      }
    },
    {
      title: $t({ defaultMessage: 'Capacity' }),
      dataIndex: 'capacity',
      key: 'capacity',
      render: function (_, row) {
        const percent = getCapicityWithPercent(row?.capacity)
        return <UI.Progress
          percent={percent}
          strokeWidth={20}
          strokeColor={cssStr('--acx-semantics-green-50')}
          trailColor={cssStr('--acx-neutrals-40')}
          strokeLinecap={'butt'}
        />
      }
    }
  ]

  return <Loader states={[{
    isLoading: isFileSystemDataLoading,
    isFetching: isFileSystemDataFetching
  }]}>
    {
      fileSystemData && fileSystemData.length > 0
        ? <Table
          style={{
            marginTop: '8px'
          }}
          columns={columns}
          dataSource={fileSystemData}
          rowKey='partition'
          pagination={{
            defaultPageSize: 4,
            pageSize: 4,
            showSizeChanger: false,
            showQuickJumper: false
          }}/>
        : <UI.Wrapper
          style={{
            justifyContent: 'center'
          }}>
          <NoActiveContent
            text={$t({ defaultMessage: 'No Disk File System Utilization data' })} />
        </UI.Wrapper>
    }
  </Loader>
}