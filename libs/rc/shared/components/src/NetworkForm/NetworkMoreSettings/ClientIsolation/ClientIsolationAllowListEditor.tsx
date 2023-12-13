
import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Table, TableProps, Tooltip }                         from '@acx-ui/components'
import { useGetClientIsolationListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { ClientIsolationVenue, NetworkVenue }                 from '@acx-ui/rc/utils'


const { useWatch } = Form

const defaultVenueListPayload = {
  fields: ['name', 'id', 'dhcp.enabled'],
  page: 1,
  pageSize: 10000
}

const clientIsolationVenuesFieldName = ['wlan','advancedCustomization', 'clientIsolationVenues']

interface ClientIsolationAllowListEditorProps {
  networkVenues?: NetworkVenue[]
}

// eslint-disable-next-line max-len
export default function ClientIsolationAllowListEditor (props: ClientIsolationAllowListEditorProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { networkVenues } = props
  const form = Form.useFormInstance()

  const clientIsolationVenues = useWatch<ClientIsolationVenue[]>(clientIsolationVenuesFieldName)
  const clientIsolationVenuesInitValue = networkVenues
    ? networkVenues.map(nv => ({
      venueId: nv.venueId,
      clientIsolationAllowlistId: nv.clientIsolationAllowlistId
    }))
    : []

  const setAllowList = (venueId: string, policyId: string) => {
    const clientIsolationVenue: ClientIsolationVenue = {
      venueId,
      clientIsolationAllowlistId: policyId
    }

    if (!clientIsolationVenues || clientIsolationVenues.length === 0) {
      // eslint-disable-next-line max-len
      form.setFieldValue(clientIsolationVenuesFieldName, [clientIsolationVenue])
      return
    }

    const targetIndex = clientIsolationVenues.findIndex(v => v.venueId === venueId)

    if (targetIndex === -1) {
      clientIsolationVenues.push(clientIsolationVenue)
    } else {
      clientIsolationVenues.splice(targetIndex, 1, clientIsolationVenue)
    }

    // eslint-disable-next-line max-len
    form.setFieldValue(clientIsolationVenuesFieldName, clientIsolationVenues)
  }

  const venuesList = useVenuesListQuery({
    params,
    payload: {
      ...defaultVenueListPayload,
      filters: {
        id: networkVenues?.map(nv => nv.venueId) ?? []
      }
    }
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
        const target = venuesList.data?.data.find(venue => venue.id === row.venueId)
        return target?.name
      }
    },
    {
      title: $t({ defaultMessage: 'Isolation Allowlist' }),
      key: 'clientIsolationAllowlistId',
      dataIndex: 'clientIsolationAllowlistId',
      render: function (data, row) {
        const initValue = clientIsolationVenuesInitValue.find(c => c.venueId === row.venueId)
        const correspondingVenue = venuesList.data?.data.find(venue => venue.id === row.venueId)
        const isVenueDhcpEnabled = correspondingVenue?.dhcp?.enabled ?? false

        return (
          <Tooltip title={isVenueDhcpEnabled
            // eslint-disable-next-line max-len
            ? $t({ defaultMessage: 'Client isolation allowlist cannot be applied when DHCP is enabled' })
            : null
          }>
            <Select
              defaultValue={initValue?.clientIsolationAllowlistId ?? null}
              onChange={(value: string) => setAllowList(row.venueId!, value)}
              disabled={!correspondingVenue || isVenueDhcpEnabled}
              options={[
                { label: $t({ defaultMessage: 'Not active...' }), value: null, title: null },
                ...policyOptions
              ]}
            >
            </Select>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <Form.Item
      name={clientIsolationVenuesFieldName}
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
