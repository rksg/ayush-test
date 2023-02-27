
import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Table, TableProps }                                        from '@acx-ui/components'
import { useGetClientIsolationListQuery, useNetworkVenueListQuery } from '@acx-ui/rc/services'
import { ClientIsolationVenue, NetworkVenue }                       from '@acx-ui/rc/utils'


const { useWatch } = Form

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
}

// eslint-disable-next-line max-len
export default function ClientIsolationAllowListEditor (props: ClientIsolationAllowListEditorProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { networkVenues } = props
  const form = Form.useFormInstance()

  // eslint-disable-next-line max-len
  const clientIsolationVenues = useWatch<ClientIsolationVenue[]>(['wlan','advancedCustomization', 'clientIsolationVenues'])
  const clientIsolationVenuesInitValue = networkVenues
    // eslint-disable-next-line max-len
    ? networkVenues.map(nv => ({ venueId: nv.venueId, clientIsolationAllowlistId: nv.clientIsolationAllowlistId }))
    : []

  const setAllowList = (venueId: string, policyId: string) => {
    const clientIsolationVenue: ClientIsolationVenue = {
      venueId,
      clientIsolationAllowlistId: policyId
    }

    if (!clientIsolationVenues || clientIsolationVenues.length === 0) {
      // eslint-disable-next-line max-len
      form.setFieldValue(['wlan','advancedCustomization', 'clientIsolationVenues'], [clientIsolationVenue])
      return
    }

    const targetIndex = clientIsolationVenues.findIndex(v => v.venueId === venueId)

    if (targetIndex === -1) {
      clientIsolationVenues.push(clientIsolationVenue)
    } else {
      clientIsolationVenues.splice(targetIndex, 1, clientIsolationVenue)
    }

    // eslint-disable-next-line max-len
    form.setFieldValue(['wlan','advancedCustomization', 'clientIsolationVenues'], clientIsolationVenues)
  }

  const venueListForNameMap = useNetworkVenueListQuery({
    params: { networkId: 'UNKNOWN-NETWORK-ID', ...params },
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
        const target = venueListForNameMap.data?.data.find(venue => venue.id === row.venueId)
        return target?.name
      }
    },
    {
      title: $t({ defaultMessage: 'Isolation Allowlist' }),
      key: 'clientIsolationAllowlistId',
      dataIndex: 'clientIsolationAllowlistId',
      render: function (data, row) {
        const target = clientIsolationVenuesInitValue.find(c => c.venueId === row.venueId)

        return (
          <Select
            defaultValue={target ? target.clientIsolationAllowlistId : ''}
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
    <Form.Item
      name={['wlan','advancedCustomization', 'clientIsolationVenues']}
      initialValue={clientIsolationVenuesInitValue}
    >
      <Table<NetworkVenue>
        type='form'
        columns={columns}
        dataSource={networkVenues}
        pagination={false}
        rowKey='venueId'
      />
    </Form.Item>
  )
}
