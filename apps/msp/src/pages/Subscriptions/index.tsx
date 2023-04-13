
import { useEffect, useState } from 'react'

import { Row, Space } from 'antd'
import { useIntl }    from 'react-intl'

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
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  SubscriptionUsageReportDialog
} from '@acx-ui/msp/components'
import {
  useMspEntitlementListQuery,
  useMspAssignmentSummaryQuery,
  useRefreshMspEntitlementMutation
} from '@acx-ui/rc/services'
import {
  dateSort,
  defaultSort,
  EntitlementUtil,
  MspEntitlement,
  sortProp
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponent'

export function Subscriptions () {
  const { $t } = useIntl()
  const [totalWifiCount, setTotalWifiCount] = useState(0)
  const [usedWifiCount, setUsedWifiCount] = useState(0)
  const [totalSwitchCount, setTotalSwitchCount] = useState(0)
  const [usedSwitchCount, setUsedSwitchCount] = useState(0)
  const [showDialog, setShowDialog] = useState(false)

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
        const effectiveDate = new Date(Date.parse(row.effectiveDate))
        return formatter(DateFormatEnum.DateFormat)(effectiveDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      render: function (_, row) {
        const expirationDate = new Date(Date.parse(row.expirationDate))
        return formatter(DateFormatEnum.DateFormat)(expirationDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Time left' }),
      dataIndex: 'expirationDate',
      // key needs to be unique
      key: 'timeLeft',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const remainingDays = EntitlementUtil.timeLeftInDays(row.expirationDate)
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
      filterable: true
    }
  ]

  const actions: TableProps<MspEntitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Generate Usage Report' }),
      onClick: () => {
        setShowDialog(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Manage Subscriptions' }),
      onClick: () => {
        const licenseUrl = get('MANAGE_LICENSES')
        window.open(licenseUrl, '_blank')
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
    useEffect(() => {
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
    })

    const barColors = [
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-neutrals-30')
    ]

    return (
      <>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Subscription Utilization' })}</Subtitle>
        <Row>
          <label>{$t({ defaultMessage: 'Wi-Fi' })}</label>
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

          <label style={{ marginLeft: 40 }}>{$t({ defaultMessage: 'Switch' })}</label>
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
          settingsId='msp-subscription-table'
          columns={columns}
          actions={actions}
          dataSource={subscriptionData}
          rowKey='id'
        />
        <SubscriptionUsageReportDialog
          visible={showDialog}
          setVisible={setShowDialog}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'MSP Subscriptions' })}
        extra={
          <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
        }
      />
      <SubscriptionUtilization />
      <SubscriptionTable />
    </>
  )
}
