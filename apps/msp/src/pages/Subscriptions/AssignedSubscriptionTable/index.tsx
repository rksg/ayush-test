
import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useMspAssignmentHistoryQuery
} from '@acx-ui/msp/services'
import { MspAssignmentHistory } from '@acx-ui/msp/utils'
import {
  dateSort,
  defaultSort,
  EntitlementUtil,
  sortProp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from '../styledComponent'

export function AssignedSubscriptionTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const columns: TableProps<MspAssignmentHistory>['columns'] = [
    {
      title: $t({ defaultMessage: 'Subscription' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'deviceSubType',
      key: 'deviceSubType',
      render: function (_, row) {
        if (row.deviceType === 'MSP_WIFI')
          return EntitlementUtil.tempLicenseToString(row.trialAssignment)
        return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
      }
    },
    {
      title: $t({ defaultMessage: 'Assigned Devices' }),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Starting Date' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      sorter: { compare: sortProp('effectiveDate', dateSort) },
      render: function (_, row) {
        const effectiveDate = new Date(Date.parse(row.dateEffective))
        return formatter(DateFormatEnum.DateFormat)(effectiveDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      render: function (_, row) {
        const expirationDate = new Date(Date.parse(row.dateExpires))
        return formatter(DateFormatEnum.DateFormat)(expirationDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Time left' }),
      dataIndex: 'expirationDate',
      // key needs to be unique
      key: 'timeLeft',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      // active license should be first
      defaultSortOrder: 'descend',
      render: function (_, row) {
        const remainingDays = EntitlementUtil.timeLeftInDays(row.dateExpires)
        const TimeLeftWrapper = remainingDays < 0
          ? UI.Expired
          : (remainingDays <= 60 ? UI.Warning : Space)
        return <TimeLeftWrapper>{
          EntitlementUtil.timeLeftValues(remainingDays)
        }</TimeLeftWrapper>
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: { compare: sortProp('status', defaultSort) },
      render: function (_, row) {
        if( row.status === 'VALID') {
          return $t({ defaultMessage: 'Active' })
        } else {
          return $t({ defaultMessage: 'Expired' })
        }
      }
    }
  ]

  const AssignedTable = () => {
    const queryResults = useMspAssignmentHistoryQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })

    const subscriptionData = queryResults.data?.map(response => {
      return {
        ...response,
        name: EntitlementUtil.getMspDeviceTypeText(response?.deviceType)
      }
    }).filter(rec => rec.status === 'VALID' && rec.mspEcTenantId === tenantId)

    return (
      <Loader states={[queryResults]}>
        <Table
          style={{ marginTop: '12px' }}
          settingsId='msp-assigned-subscription-table'
          columns={columns}
          dataSource={subscriptionData}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <AssignedTable />
  )
}
