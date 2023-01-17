import { useContext } from 'react'

import { Select }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps }                                        from '@acx-ui/components'
import { useGetClientIsolationListQuery, useNetworkVenueListQuery } from '@acx-ui/rc/services'
import { NetworkVenue }                                             from '@acx-ui/rc/utils'

import NetworkFormContext from '../../NetworkFormContext'

const defaultNetworkVenueListPayload = {
  fields: [
    'name',
    'id'
  ],
  page: 1,
  pageSize: 10000
}

// eslint-disable-next-line max-len
export default function ClientIsolationAllowListEditor () {
  const { $t } = useIntl()
  const { data, setData } = useContext(NetworkFormContext)
  const params = useParams()
  // eslint-disable-next-line max-len
  const networkVenueList = useNetworkVenueListQuery({
    params,
    payload: defaultNetworkVenueListPayload
  }, { skip: !data?.venues })

  const { policyOptions } = useGetClientIsolationListQuery({ params },{
    selectFromResult ({ data }) {
      return {
        policyOptions: data?.map(item => ({ label: item.name, value: item.id })) ?? []
      }
    }
  })

  const onPolicyChange = (venueId: string, policyId: string) => {
    if (!data?.venues) {
      return
    }

    const targetVenue = data.venues.find(v => v.id === venueId)

    if (!targetVenue) {
      return
    }

    targetVenue.clientIsolationAllowlistId = policyId

    setData && setData({ ...data, venues: data.venues })
  }

  const columns: TableProps<NetworkVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if (!networkVenueList.data) {
          return '--'
        }

        const target = networkVenueList.data.data.find(venue => venue.id === row.venueId)
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
            onChange={(value: string) => onPolicyChange(row.venueId!, value)}
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
      dataSource={data?.venues}
      pagination={false}
      rowKey='venueId'
    />
  )
}
