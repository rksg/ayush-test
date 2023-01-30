
import { useState } from 'react'

import { Row }       from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'

import {
  Button,
  cssStr,
  Loader,
  PageHeader,
  StackedBarChart,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useMspEntitlementListQuery,
  useMspAssignmentSummaryQuery
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  EntitlementUtil,
  MspEntitlement
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

export function Subscriptions () {
  const { $t } = useIntl()
  const [totalWifiCount, setTotalWifiCount] = useState(0)
  const [usedWifiCount, setUsedWifiCount] = useState(0)
  const [totalSwitchCount, setTotalSwitchCount] = useState(0)
  const [usedSwitchCount, setUsedSwitchCount] = useState(0)

  const columns: TableProps<MspEntitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'Subscription' }),
      dataIndex: 'name',
      sorter: true,
      key: 'name',
      filterable: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row) {
        return EntitlementUtil.getMspDeviceTypeText(row.deviceType)
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'deviceType',
      sorter: true,
      key: 'deviceType',
      render: function (data, row) {
        if (row.deviceType === 'MSP_WIFI')
          return EntitlementUtil.tempLicenseToString(row.isTrial)
        return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Count' }),
      dataIndex: 'quantity',
      sorter: true,
      key: 'quantity',
      render: function (data, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Starting Date' }),
      dataIndex: 'effectiveDate',
      sorter: true,
      key: 'effectiveDate',
      render: function (data, row) {
        return moment(row.effectiveDate).format(DateFormatEnum.UserDateFormat)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'expirationDate',
      sorter: true,
      key: 'expirationDate',
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
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      filterable: true,
      sorter: true
      // render: function (data, row) {
      //   const remaingDays = EntitlementUtil.timeLeftInDays(row.expirationDate)
      //   return EntitlementUtil.timeLeftValues(remaingDays)
      // }
    }
  ]

  const actions: TableProps<MspEntitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Generate Usage Report' }),
      onClick: () => {
      }
    },
    {
      label: $t({ defaultMessage: 'Manage Subsciptions' }),
      onClick: () => {
        window.open('https://support.ruckuswireless.com/cloud_subscriptions', '_blank')
      }
    },
    {
      label: $t({ defaultMessage: 'Refresh' }),
      onClick: () => {
      }
    }
  ]

  const SubscriptionUtilization = () => {
    const queryResults = useMspAssignmentSummaryQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })
    if (queryResults.data) {
      const wifiData = queryResults.data?.filter(n => n.deviceType === 'MSP_WIFI')
      let wifiQuantity = 0
      let wifiUsed = 0
      wifiData.forEach(summary => {
        wifiQuantity += summary.quantity + summary.remainingDevices
        wifiUsed += summary.quantity
        setTotalWifiCount(wifiQuantity)
        setUsedWifiCount(wifiUsed)
      })
    }
    if (queryResults.data) {
      const switchData = queryResults.data?.filter(n => n.deviceType === 'MSP_SWITCH')
      let switchQuantity = 0
      let switchUsed = 0
      switchData.forEach(summary => {
        switchQuantity += summary.quantity + summary.remainingDevices
        switchUsed += summary.quantity
        setTotalSwitchCount(switchQuantity)
        setUsedSwitchCount(switchUsed)
      })
    }

    const barColors = [
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-neutrals-30')
    ]
    // const barEmptyColors = [
    //   cssStr('--acx-neutrals-20')
    // ]

    // function GetUtilizationChart (wifi: string) {
    //   return <>
    //     <StackedBarChart
    //       style={{ marginLeft: 8, height: 16, width: 135 }}
    //       barWidth={12}
    //       data={[{
    //         category: 'emptyStatus',
    //         series: [{
    //           name: '',
    //           value: 1
    //         }]
    //       }]}
    //       showTooltip={false}
    //       showLabels={false}
    //       showTotal={false}
    //       barColors={barEmptyColors}
    //     />
    //     <label style={{ marginLeft: 8 }}>0</label>
    //   </>
    // }

    return (
      <>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Subscription Utilization' })}</Subtitle>
        <Row>
          <label>Wi-Fi</label>
          <StackedBarChart
            style={{ marginLeft: 8, height: 16, width: 135 }}
            showLabels={false}
            showTotal={false}
            showTooltip={false}
            barWidth={12}
            data={[{
              category: 'Wi-Fi Licenses: ',
              series: [
                { name: 'used',
                  value: usedWifiCount * 100/totalWifiCount },
                { name: 'available',
                  value: (totalWifiCount-usedWifiCount)* 100/totalWifiCount }
              ]
            }]}
            barColors={barColors}
          />
          <label style={{ marginLeft: 8 }}>{usedWifiCount} / {totalWifiCount}</label>

          <label style={{ marginLeft: 40 }}>Switch</label>
          <StackedBarChart
            style={{ marginLeft: 8, height: 16, width: 135 }}
            showLabels={false}
            showTotal={false}
            showTooltip={false}
            barWidth={12}
            data={[{
              category: 'Switch Licenses: ',
              series: [
                { name: 'used',
                  value: usedSwitchCount * 100/totalSwitchCount },
                { name: 'available',
                  value: (totalSwitchCount-usedSwitchCount)* 100/totalSwitchCount }
              ]
            }]}
            barColors={barColors}
          />
          <label style={{ marginLeft: 8 }}>{usedSwitchCount} / {totalSwitchCount}</label>
        </Row>
      </>
    )
  }

  const SubscriptionTable = () => {
    const queryResults = useMspEntitlementListQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })
    return (
      <Loader states={[queryResults]}>
        <Table
          columns={columns}
          actions={actions}
          dataSource={queryResults?.data}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'MSP Subscriptions' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
        ]}
      />
      <SubscriptionUtilization />
      <SubscriptionTable />
    </>
  )
}
