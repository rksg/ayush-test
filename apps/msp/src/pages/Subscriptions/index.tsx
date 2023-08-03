
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
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
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
import { MspAssignmentSummary, MspEntitlementSummary }    from '@acx-ui/msp/utils'
import { SpaceWrapper, MspSubscriptionUtilizationWidget } from '@acx-ui/rc/components'
import {
  dateSort,
  defaultSort,
  EntitlementDeviceType,
  EntitlementDeviceTypes,
  EntitlementUtil,
  getEntitlementDeviceTypes,
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
  const [showDialog, setShowDialog] = useState(false)
  const [isAssignedActive, setActiveTab] = useState(false)
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)

  const { tenantId } = useParams()
  const subscriptionDeviceTypeList = getEntitlementDeviceTypes()
    .filter(o => o.value.startsWith('MSP'))

  const [
    refreshEntitlement
  ] = useRefreshMspEntitlementMutation()

  const getCourtesyTooltip = (total: number, courtesy: number) => {
    const purchased = total-courtesy
    return $t({ defaultMessage: 'purchased:{purchased}, courtesy:{courtesy}' },
      { purchased, courtesy })
  }

  const columns: TableProps<MspEntitlement>['columns'] = [
    ...(isDeviceAgnosticEnabled ? [
      {
        title: $t({ defaultMessage: 'Part Number' }),
        dataIndex: 'sku',
        key: 'sku',
        sorter: { compare: sortProp('sku', defaultSort) }
      }
    ]: [
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
        render: function (data: React.ReactNode, row: MspEntitlement) {
          if (row.deviceType === 'MSP_WIFI')
            return EntitlementUtil.tempLicenseToString(row.isTrial)
          return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
        }
      }
    ]),
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

  const subscriptionUtilizationTransformer = (
    deviceTypeList: EntitlementDeviceTypes,
    assignedSummary: MspAssignmentSummary[],
    data: MspEntitlementSummary[]) => {
    const result = {} as { [key in EntitlementDeviceType]: {
      total: number;
      used: number;
      assigned: number;
      courtesy: number;
      tooltip: string;
    } }

    deviceTypeList.forEach(item => {
      const deviceType = item.value
      const summaryData = data.filter(n => n.deviceType === deviceType)
      const assignedData = assignedSummary.filter(n => n.deviceType === deviceType)
      let quantity = 0
      let used = 0
      let courtesy = 0
      let assigned = 0

      // only display types that has data in summary
      if (summaryData.length > 0 || assignedData.length > 0) {
        summaryData.forEach(summary => {
          quantity += summary.quantity + summary.courtesyQuantity
          used += summary.quantity + summary.courtesyQuantity - summary.remainingLicenses
          courtesy += summary.courtesyQuantity
        })

        assignedData.forEach(summary => {
          assigned += summary.myAssignments || 0
        })

        // including to display 0 quantity.
        result[deviceType] = {
          total: quantity,
          used: used,
          assigned: assigned,
          courtesy: courtesy,
          tooltip: getCourtesyTooltip(quantity, courtesy)
        }
      }
    })

    return result
  }

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
    const summaryData = subscriptionUtilizationTransformer(
      subscriptionDeviceTypeList,
      queryResults.data ?? [],
      summaryResults.data ?? [])

    useEffect(() => {
      if (queryResults.data) {
      }
      if (summaryResults.data) {
      }
    }, [queryResults?.data, summaryResults.data])

    return (
      <>
        <Subtitle level={4} style={{ marginBottom: '12px' }}>
          {$t({ defaultMessage: 'Subscription Utilization' })}
        </Subtitle>
        <SpaceWrapper fullWidth size={100} justifycontent='flex-start'>
          {
            subscriptionDeviceTypeList.map((item) => {
              const summary = summaryData[item.value]
              return summary ? <MspSubscriptionUtilizationWidget
                key={item.value}
                deviceType={item.value}
                title={item.label}
                total={summary.total}
                assigned={summary.assigned}
                used={summary.used}
                tooltip={summary.tooltip}
              /> : ''
            })
          }
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
