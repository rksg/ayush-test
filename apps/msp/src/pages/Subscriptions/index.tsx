
import { useState } from 'react'

import { Row }     from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

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
import { hasAccesses }               from '@acx-ui/rbac'
import {
  useMspEntitlementListQuery,
  useMspAssignmentSummaryQuery,
  useRefreshMspEntitlementMutation
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

  const { tenantId } = useParams()

  const [
    refreshEntitlement
  ] = useRefreshMspEntitlementMutation()

  const columns: TableProps<MspEntitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'Subscription' }),
      dataIndex: 'name',
      key: 'name',
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'deviceSubType',
      key: 'deviceSubType',
      render: function (_, row) {
        if (row.deviceType === 'MSP_WIFI')
          return EntitlementUtil.tempLicenseToString(row.isTrial)
        return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Count' }),
      dataIndex: 'quantity',
      key: 'quantity',
      render: function (_, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Starting Date' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: function (_, row) {
        return moment(row.effectiveDate).format(DateFormatEnum.UserDateFormat)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: function (_, row) {
        return moment(row.expirationDate).format(DateFormatEnum.UserDateFormat)
      }
    },
    {
      title: $t({ defaultMessage: 'Time left' }),
      dataIndex: 'timeLeft',
      key: 'timeLeft',
      render: function (_, row) {
        const remaingDays = EntitlementUtil.timeLeftInDays(row.expirationDate)
        return EntitlementUtil.timeLeftValues(remaingDays)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      filterable: true
    }
  ]

  const actions: TableProps<MspEntitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Generate Usage Report' }),
      onClick: () => {
        // TODO
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
        refreshEntitlement({ params: { tenantId } })
          .then()
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

  const GetStatus = (status: String) => {
    if( status === 'VALID') {
      return $t({ defaultMessage: 'Active' })
    } else {
      return $t({ defaultMessage: 'Expired' })
    }
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
    const subscriptionData = queryResults.data?.map(response => {
      return {
        ...response,
        name: EntitlementUtil.getMspDeviceTypeText(response?.deviceType),
        status: GetStatus(response?.status as String)
      }
    })

    return (
      <Loader states={[queryResults]}>
        <Table
          columns={columns}
          actions={hasAccesses(actions)}
          dataSource={subscriptionData}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'MSP Subscriptions' })}
        extra={hasAccesses([
          <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
        ])}
      />
      <SubscriptionUtilization />
      <SubscriptionTable />
    </>
  )
}
