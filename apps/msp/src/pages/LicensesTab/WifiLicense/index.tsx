import { useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import {
  cssStr,
  StackedBarChart,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useMspEntitlementListQuery,
  useMspEntitlementSummaryQuery
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
      dataIndex: 'deviceType',
      sorter: true,
      key: 'deviceType',
      render: function (data, row) {
        return EntitlementUtil.tempLicenseToString(row.isTrial)
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

export function WifiLicense () {
  const [totalCount, setTotalCount] = useState(0)
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

  const WifiLicenseSummary = () => {
    const queryResults = useMspEntitlementSummaryQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })
    queryResults.data = queryResults.data?.filter(n => n.deviceType === 'MSP_WIFI')
    if (queryResults.data) {
      const summary = queryResults.data[0]
      const totalQuantity = summary.quantity + summary.courtesyQuantity
      setTotalCount(totalQuantity)
    }

    const barColors = [
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-neutrals-30')
    ]

    return (
      <Loader states={[queryResults]}>
        <label>Total Wi-Fi Licenses:
          <StackedBarChart
            style={{ marginLeft: 15, height: 50, width: 400 }}
            showLabels={false}
            barWidth={20}
            data={[{
              category: 'Total Wi-Fi Licenses: ',
              series: [
                { name: 'used', value: totalCount },
                { name: 'us', value: 18 }
              ]
            }]}
            barColors={barColors}
          />
        </label>
      </Loader>
    )
  }

  const WifiLicenseTable = () => {
    const queryResults = useMspEntitlementListQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })
    queryResults.data = queryResults.data?.filter(n => n.deviceType === 'MSP_WIFI')

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
    <>
      <WifiLicenseSummary />
      <WifiLicenseTable />
    </>
  )
}
