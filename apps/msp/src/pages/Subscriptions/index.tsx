
import { useEffect, useState } from 'react'

import { Space }              from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Subtitle,
  Table,
  TableProps,
  Tabs
} from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  SubscriptionUsageReportDialog
} from '@acx-ui/msp/components'
import {
  useMspEntitlementListQuery,
  useMspAssignmentSummaryQuery,
  useMspEntitlementSummaryQuery,
  useRefreshMspEntitlementMutation
} from '@acx-ui/msp/services'
import { SpaceWrapper, MspSubscriptionUtilizationWidget } from '@acx-ui/rc/components'
import {
  dateSort,
  defaultSort,
  EntitlementDeviceType,
  EntitlementUtil,
  MspEntitlement,
  sortProp
} from '@acx-ui/rc/utils'
import { MspTenantLink, TenantLink, useParams } from '@acx-ui/react-router-dom'

import { AssignedSubscriptionTable } from './AssignedSubscriptionTable'
import * as UI                       from './styledComponent'

const statusTypeFilterOpts = ($t: IntlShape['$t']) => [
  { key: '', value: $t({ defaultMessage: 'Show All' }) },
  {
    key: 'VALID',
    value: $t({ defaultMessage: 'Show Active' })
  },
  {
    key: 'EXPIRED',
    value: $t({ defaultMessage: 'Show Expired' })
  }
]

export function Subscriptions () {
  const { $t } = useIntl()
  const [totalWifiCount, setTotalWifiCount] = useState(0)
  const [usedWifiCount, setUsedWifiCount] = useState(0)
  const [assignedWifiCount, setAssignedWifiCount] = useState(0)
  const [wifiCourtesy, setWifiCourtesy] = useState(0)
  const [totalSwitchCount, setTotalSwitchCount] = useState(0)
  const [usedSwitchCount, setUsedSwitchCount] = useState(0)
  const [assignedSwitchCount, setAssignedSwitchCount] = useState(0)
  const [switchCourtesy, setSwitchCourtesy] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [isAssignedActive, setActiveTab] = useState(false)

  const { tenantId } = useParams()

  const [
    refreshEntitlement
  ] = useRefreshMspEntitlementMutation()

  const getCourtesyTooltip = (total: number, courtesy: number) => {
    return 'purchased: ' + (total-courtesy) + ', courtesy: ' + (courtesy)
    // return $t({ defaultMessage: 'purchased:{total}, courtesy:{courtesy}' })
  }

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
      // active license should be first
      defaultSortOrder: 'descend',
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
      filterMultiple: false,
      filterValueNullable: true,
      filterable: statusTypeFilterOpts($t),
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
    const summaryResults = useMspEntitlementSummaryQuery({ params: useParams() })

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
          // TODO
          setAssignedWifiCount(0)
        })
        const switchData = queryResults.data?.filter(n => n.deviceType === 'MSP_SWITCH')
        let switchQuantity = 0
        let switchUsed = 0
        switchData.forEach(summary => {
          switchQuantity += summary.quantity + summary.remainingDevices
          switchUsed += summary.quantity
          setTotalSwitchCount(switchQuantity)
          setUsedSwitchCount(switchUsed)
          // TODO
          setAssignedSwitchCount(0)
        })
      }
      if (summaryResults.data) {
        const wifiSummary =
          summaryResults.data.mspEntitlementSummaries.filter(n => n.deviceType === 'MSP_WIFI')
        let wifiCourtesy = 0
        wifiSummary.forEach(summary => {
          wifiCourtesy += summary.courtesyQuantity
          setWifiCourtesy(wifiCourtesy)
        })
        const switchSummary =
          summaryResults.data.mspEntitlementSummaries.filter(n => n.deviceType === 'MSP_SWITCH')
        let switchCourtesy = 0
        switchSummary.forEach(summary => {
          switchCourtesy += summary.courtesyQuantity
          setSwitchCourtesy(switchCourtesy)
        })
      }
    }, [queryResults?.data, summaryResults.data])

    return (
      <>
        <Subtitle level={4} style={{ marginBottom: '12px' }}>
          {$t({ defaultMessage: 'Subscription Utilization' })}
        </Subtitle>
        <SpaceWrapper fullWidth size={100} justifycontent='flex-start'>
          <MspSubscriptionUtilizationWidget
            deviceType={EntitlementDeviceType.MSP_WIFI}
            title={$t({ defaultMessage: 'Wi-Fi' })}
            total={totalWifiCount}
            assigned={assignedWifiCount}
            used={usedWifiCount}
            tooltip={getCourtesyTooltip(totalWifiCount, wifiCourtesy)}
          />
          <MspSubscriptionUtilizationWidget
            deviceType={EntitlementDeviceType.MSP_SWITCH}
            title={$t({ defaultMessage: 'Switch' })}
            total={totalSwitchCount}
            assigned={assignedSwitchCount}
            used={usedSwitchCount}
            tooltip={getCourtesyTooltip(totalSwitchCount, switchCourtesy)}
          />
        </SpaceWrapper>
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
    const subscriptionData = queryResults.data?.map(response => {
      return {
        ...response,
        name: EntitlementUtil.getMspDeviceTypeText(response?.deviceType)
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
        {showDialog && <SubscriptionUsageReportDialog
          visible={showDialog}
          setVisible={setShowDialog}
        />}
      </Loader>
    )
  }

  const onTabChange = (tab: string) => {
    setActiveTab(tab === 'assignedSubscriptions')
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Subscriptions' })}
        extra={[
          <MspTenantLink to='/msplicenses/assign'>
            <Button
              hidden={!isAssignedActive}
              type='primary'>{$t({ defaultMessage: 'Assign MSP Subscriptions' })}</Button>
          </MspTenantLink>,
          <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
        ]}
      />
      <Tabs
        defaultActiveKey='mspSubscriptions'
        onChange={onTabChange}
      >
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'MSP Subscriptions' })}
          key='mspSubscriptions' />
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'MSP Assigned Subscriptions' })}
          key='assignedSubscriptions' />
      </Tabs>

      <SubscriptionUtilization />
      {isAssignedActive ? <AssignedSubscriptionTable /> : <SubscriptionTable />}
    </>
  )
}
