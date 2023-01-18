import { Select }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps }                                        from '@acx-ui/components'
import { useGetClientIsolationListQuery, useNetworkVenueListQuery } from '@acx-ui/rc/services'
import { NetworkVenue }                                             from '@acx-ui/rc/utils'

const defaultNetworkVenueListPayload = {
  fields: [
    'name',
    'id'
  ],
  page: 1,
  pageSize: 10000
}

interface ClientIsolationAllowListEditorProps {
  networkVenues?: NetworkVenue[]
  setAllowList: (venueId: string, policyId: string) => void
}

// eslint-disable-next-line max-len
export default function ClientIsolationAllowListEditor (props: ClientIsolationAllowListEditorProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { networkVenues, setAllowList } = props
  // eslint-disable-next-line max-len
  const venueListForNameMap = useNetworkVenueListQuery({
    params,
    payload: defaultNetworkVenueListPayload
  })

  const { policyOptions } = useGetClientIsolationListQuery({ params },{
    selectFromResult ({ data }) {
      return {
        policyOptions: data?.map(item => ({ label: item.name, value: item.id })) ?? []
      }
    }
  })

  const columns: TableProps<NetworkVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if (!venueListForNameMap.data) {
          return '--'
        }

        const target = venueListForNameMap.data.data.find(venue => venue.id === row.venueId)
        return target?.name
      }
    },
    {
      title: $t({ defaultMessage: 'Isolation Allowlist' }),
      key: 'clientIsolationAllowlistId',
      dataIndex: 'clientIsolationAllowlistId',
      render: function (data, row) {
        return (
          <Select
            style={{ width: '100%' }}
            onChange={(value: string) => setAllowList(row.venueId!, value)}
            options={[
              { label: $t({ defaultMessage: 'Not active...' }), value: '' },
              ...policyOptions
            ]}
          >
          </Select>
        )
      }
    }
  ]

  return (
    <Table<NetworkVenue>
      type='form'
      columns={columns}
      dataSource={networkVenues}
      pagination={false}
      rowKey='venueId'
    />
  )
}
