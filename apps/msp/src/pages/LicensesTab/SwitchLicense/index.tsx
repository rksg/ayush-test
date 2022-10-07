import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useMspEntitlementListQuery
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  EntitlementUtil,
  MspEntitlement
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<MspEntitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'License for' }),
      dataIndex: 'name',
      sorter: true,
      key: 'name',
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row) {
        return EntitlementUtil.getMspDeviceTypeUnitText(row.deviceType, row.quantity)
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'deviceSubType',
      sorter: true,
      key: 'deviceSubType',
      render: function (data, row) {
        return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
      }
    },
    {
      title: $t({ defaultMessage: 'Activated on' }),
      dataIndex: 'effectiveDate',
      sorter: true,
      key: 'effectiveDate',
      align: 'center',
      render: function (data, row) {
        return moment(row.effectiveDate).format(DateFormatEnum.UserDateFormat)
      }
    },
    {
      title: $t({ defaultMessage: 'Expires on' }),
      dataIndex: 'expirationDate',
      sorter: true,
      key: 'expirationDate',
      align: 'center',
      render: function (data, row) {
        return moment(row.expirationDate).format(DateFormatEnum.UserDateFormat)
      }
    },
    {
      title: $t({ defaultMessage: 'Time left' }),
      dataIndex: 'timeLeft',
      key: 'timeLeft',
      sorter: true,
      render: function (data, row) {
        const remaingDays = EntitlementUtil.timeLeftInDays(row.expirationDate)
        return EntitlementUtil.timeLeftValues(remaingDays)
      }
    }
  ]
  return columns
}

export function SwitchLicense () {
  const { $t } = useIntl()

  const actions: TableProps<MspEntitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Show Expired Licenses' }),
      onClick: () => {
      }
    },
    {
      label: $t({ defaultMessage: 'License Management' }),
      onClick: () => {
      }
    }
  ]

  const SwitchLicenseTable = () => {
    const queryResults = useMspEntitlementListQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })
    queryResults.data = queryResults.data?.filter(n => n.deviceType === 'MSP_SWITCH')

    return (
      <Loader states={[queryResults]}>
        <Table
          columns={useColumns()}
          actions={actions}
          dataSource={queryResults?.data}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <SwitchLicenseTable />
  )
}
