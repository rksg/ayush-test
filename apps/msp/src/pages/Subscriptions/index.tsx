
import { useContext, useEffect, useState } from 'react'

import { Space }              from 'antd'
import _                      from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import {
  Button,
  Filter,
  Loader,
  PageHeader,
  Subtitle,
  Table,
  TableProps,
  Tabs,
  Tooltip
} from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { InformationSolid }          from '@acx-ui/icons'
import {
  LicenseCompliance,
  PendingActivations,
  SubscriptionUsageReportDialog
} from '@acx-ui/msp/components'
import {
  useMspEntitlementListQuery,
  useMspAssignmentSummaryQuery,
  useMspEntitlementSummaryQuery,
  useRefreshMspEntitlementMutation,
  useGetEntitlementsAttentionNotesQuery
} from '@acx-ui/msp/services'
import { GeneralAttentionNotesPayload, MspAssignmentSummary, MspAttentionNotesPayload, MspEntitlementSummary, MspRbacUrlsInfo } from '@acx-ui/msp/utils'
import { SpaceWrapper, MspSubscriptionUtilizationWidget }                                                                       from '@acx-ui/rc/components'
import { useGetTenantDetailsQuery, useRbacEntitlementListQuery, useRbacEntitlementSummaryQuery }                                from '@acx-ui/rc/services'
import {
  AdminRbacUrlsInfo,
  dateSort,
  defaultSort,
  EntitlementDeviceType,
  EntitlementDeviceTypes,
  EntitlementSummaries,
  EntitlementUtil,
  getEntitlementDeviceTypes,
  MspEntitlement,
  sortProp
} from '@acx-ui/rc/utils'
import { MspTenantLink, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                        from '@acx-ui/types'
import { filterByAccess, getUserProfile, hasAllowedOperations, hasRoles }   from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                                         from '@acx-ui/utils'

import HspContext from '../../HspContext'

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
  },
  {
    key: 'FUTURE',
    value: $t({ defaultMessage: 'Show Future' })
  },
  {
    key: 'VALID,FUTURE',
    value: $t({ defaultMessage: 'Show Active & Future' })
  }
]

const defaultSelectedFilters: Filter = {
  status: ['VALID', 'FUTURE']
}

const entitlementRefreshPayload = {
  status: 'synchronize',
  usageType: 'ASSIGNED'
}

export function Subscriptions () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/mspLicenses', 'v')
  const { rbacOpsApiEnabled } = getUserProfile()
  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([
      [getOpsApi(MspRbacUrlsInfo.addMspAssignment), getOpsApi(MspRbacUrlsInfo.updateMspAssignment),
        getOpsApi(MspRbacUrlsInfo.deleteMspAssignment)]
    ])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const [showDialog, setShowDialog] = useState(false)
  const [isAssignedActive, setActiveTab] = useState(false)
  const [hasAttentionNotes, setHasAttentionNotes] = useState(false)
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const isPendingActivationEnabled = useIsSplitOn(Features.ENTITLEMENT_PENDING_ACTIVATION_TOGGLE)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isComplianceEnabled = useIsSplitOn(Features.ENTITLEMENT_LICENSE_COMPLIANCE_TOGGLE)
  const showCompliance = isvSmartEdgeEnabled && isComplianceEnabled
  const isExtendedTrialToggleEnabled = useIsSplitOn(Features.ENTITLEMENT_EXTENDED_TRIAL_TOGGLE)
  const isComplianceNotesEnabled = useIsSplitOn(Features.ENTITLEMENT_COMPLIANCE_NOTES_TOGGLE)
  const isAttentionNotesToggleEnabled = useIsSplitOn(Features.ENTITLEMENT_ATTENTION_NOTES_TOGGLE)
  const isSubscriptionPagesizeToggleEnabled = useIsSplitOn(Features.SUBSCRIPTIONS_PAGESIZE_TOGGLE)
  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  const entitlementListPayload = {
    fields: [
      'externalId',
      'licenseType',
      'effectiveDate',
      'expirationDate',
      'quantity',
      'sku',
      'licenseDesc',
      'isR1SKU',
      'status',
      'isTrial',
      'graceEndDate',
      'usageType'
    ],
    page: 1,
    pageSize: isSubscriptionPagesizeToggleEnabled ? 10000 : 1000,
    sortField: 'expirationDate',
    sortOrder: 'DESC',
    filters: {
      licenseType: solutionTokenFFToggled ? ['APSW', 'SLTN_TOKEN'] : ['APSW'],
      usageType: 'ASSIGNED'
    }
  }

  const { data: queryData } = useGetEntitlementsAttentionNotesQuery(
    { payload: isAttentionNotesToggleEnabled ? GeneralAttentionNotesPayload
      : MspAttentionNotesPayload },
    { skip: !isComplianceNotesEnabled })

  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const { tenantId, activeTab } = useParams()

  const { data: tenantDetailsData } = useGetTenantDetailsQuery({ })

  const subscriptionDeviceTypeList = isEntitlementRbacApiEnabled
    ? getEntitlementDeviceTypes()
    : getEntitlementDeviceTypes().filter(o => o.value.startsWith('MSP'))

  const [
    refreshEntitlement
  ] = useRefreshMspEntitlementMutation()

  useEffect(() => {
    setHasAttentionNotes(!_.isEmpty(queryData?.data))
  }, [queryData])

  const getCourtesyTooltip = (total: number, courtesy: number) => {
    const purchased = total-courtesy
    return $t({ defaultMessage: 'purchased: {purchased}, courtesy: {courtesy}' },
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
        sorter: { compare: sortProp('name', defaultSort) },
        filterable: true
      },
      {
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'deviceSubType',
        key: 'deviceSubType',
        sorter: { compare: sortProp('deviceSubType', defaultSort) },
        render: function (data: React.ReactNode, row: MspEntitlement) {
          if (row.deviceType === EntitlementDeviceType.MSP_WIFI)
            return EntitlementUtil.tempLicenseToString(row.isTrial)
          return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
        }
      }
    ]),
    {
      title: isvSmartEdgeEnabled ? $t({ defaultMessage: 'License Count' })
        : $t({ defaultMessage: 'Device Count' }),
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
          (isvSmartEdgeEnabled && remainingDays < 0) ? noDataDisplay
            : EntitlementUtil.timeLeftValues(remainingDays)
        }</TimeLeftWrapper>
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      filterMultiple: false,
      filterValueNullable: true,
      filterValueArray: true,
      filterable: statusTypeFilterOpts($t),
      sorter: { compare: sortProp('status', defaultSort) },
      render: function (_, row) {
        if( row.status === 'VALID') {
          return $t({ defaultMessage: 'Active' })
        } else if ( row.status === 'FUTURE') {
          return $t({ defaultMessage: 'Future' })
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
      rbacOpsIds: [getOpsApi(AdminRbacUrlsInfo.refreshLicensesData)],
      onClick: () => {
        const licenseUrl = get('MANAGE_LICENSES')
        window.open(licenseUrl, '_blank')
      }
    },
    {
      label: $t({ defaultMessage: 'Refresh' }),
      rbacOpsIds: [getOpsApi(AdminRbacUrlsInfo.refreshLicensesData)],
      onClick: () => {
        refreshEntitlement({ params: { tenantId }, payload: entitlementRefreshPayload,
          enableRbac: isEntitlementRbacApiEnabled })
          .then()
      }
    }
  ]

  const rbacSubscriptionUtilizationTransformer = (
    deviceTypeList: EntitlementDeviceTypes,
    data: EntitlementSummaries[]) => {
    const result = {} as { [key in EntitlementDeviceType]: {
      total: number;
      used: number;
      assigned: number;
      courtesy: number;
      tooltip: string;
      trial: boolean;
    } }

    deviceTypeList.forEach(item => {
      const isTrial = [EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP,
        EntitlementDeviceType.MSP_APSW_TEMP]
        .includes(item.value)
      const licenseTypeType = !isTrial
        ? item.value
        : item.value === EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP
          ? EntitlementDeviceType.SLTN_TOKEN
          : EntitlementDeviceType.APSW
      const summaryData =
        data.filter(n => n.licenseType === licenseTypeType && n.isTrial === isTrial)
      let quantity = 0
      let used = 0
      let courtesy = 0
      let assigned = 0

      // only display types that has data in summary
      if (summaryData.length > 0) {
        summaryData.forEach(summary => {
          quantity += summary.purchasedQuantity + summary.courtesyQuantity
          courtesy += summary.courtesyQuantity
          // usedQuantity includes used by EC and MSP
          used += (summary.usedQuantity - summary.usedQuantityForOwnAssignment)
          assigned += summary.usedQuantityForOwnAssignment
        })

        // including to display 0 quantity.
        result[item.value] = {
          total: quantity,
          used: used,
          assigned: assigned,
          courtesy: courtesy,
          tooltip: getCourtesyTooltip(quantity, courtesy),
          trial: isTrial
        }
      }
    })

    return result
  }

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
      trial: boolean;
    } }

    deviceTypeList.forEach(item => {
      const isTrial = [EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP,
        EntitlementDeviceType.MSP_APSW_TEMP]
        .includes(item.value)
      const deviceType = !isTrial
        ? item.value
        : item.value === EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP
          ? EntitlementDeviceType.MSP_SLTN_TOKEN
          : EntitlementDeviceType.MSP_APSW
      const summaryData =
        data.filter(n => n.deviceType === deviceType && n.trial === isTrial)
      const assignedData =
        assignedSummary.filter(n => n.deviceType === deviceType && n.trial === isTrial)
      let quantity = 0
      let used = 0
      let courtesy = 0
      let assigned = 0

      // only display types that has data in summary
      if (summaryData.length > 0 || assignedData.length > 0) {
        summaryData.forEach(summary => {
          quantity += summary.quantity + summary.courtesyQuantity
          courtesy += summary.courtesyQuantity
        })

        assignedData.forEach(summary => {
          assigned += summary.myAssignments || 0
          used += summary.quantity
        })

        // including to display 0 quantity.
        result[item.value] = {
          total: quantity,
          used: used,
          assigned: assigned,
          courtesy: courtesy,
          tooltip: getCourtesyTooltip(quantity, courtesy),
          trial: isTrial
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

    const entitlementSummaryPayload = {
      filters: {
        licenseType: solutionTokenFFToggled ? ['APSW', 'SLTN_TOKEN'] : ['APSW'],
        usageType: 'ASSIGNED'
      }
    }

    const rbacSummaryResults =
      useRbacEntitlementSummaryQuery(
        { params: useParams(), payload: entitlementSummaryPayload },
        { skip: !isEntitlementRbacApiEnabled })

    const summaryResults =
      useMspEntitlementSummaryQuery(
        { params: useParams() },
        { skip: isEntitlementRbacApiEnabled })

    const summaryData = isEntitlementRbacApiEnabled
      ? rbacSubscriptionUtilizationTransformer(
        subscriptionDeviceTypeList,
        rbacSummaryResults.data ?? [])
      : subscriptionUtilizationTransformer(
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
        <Subtitle level={3} style={{ marginBottom: '12px' }}>
          {$t({ defaultMessage: 'Subscription Utilization' })}
        </Subtitle>

        <SpaceWrapper
          wrap={solutionTokenFFToggled}
          size={solutionTokenFFToggled ? 40 : 100}
          justifycontent='flex-start'
          style={{ marginBottom: '20px' }}>
          {
            subscriptionDeviceTypeList.map((item) => {
              const showExtendedTrial = tenantDetailsData?.extendedTrial
                && isExtendedTrialToggleEnabled
              const summary = summaryData[item.value]
              const showUtilBar = isExtendedTrialToggleEnabled ? summary : (summary &&
                  (![EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP,
                    EntitlementDeviceType.MSP_APSW_TEMP]
                    .includes(item.value) || isAssignedActive))

              if (isvSmartEdgeEnabled && ![EntitlementDeviceType.MSP_SLTN_TOKEN,
                EntitlementDeviceType.MSP_SLTN_TOKEN_TEMP].includes(item.value)) {
                item.label = $t({ defaultMessage: 'Device Networking' })
              }
              return showUtilBar ? <MspSubscriptionUtilizationWidget
                key={item.value}
                deviceType={item.value}
                title={item.label}
                multiLine={isvSmartEdgeEnabled}
                total={summary.total}
                assigned={summary.assigned}
                used={summary.used}
                trial={summary.trial}
                tooltip={summary.tooltip}
                extendedTrial={showExtendedTrial ?? false}
              /> : ''
            })
          }
        </SpaceWrapper>
      </>
    )
  }

  const SubscriptionTable = () => {
    const { data: rbacQueryResults, ...rbacQueryState } = useRbacEntitlementListQuery(
      { params: useParams(), payload: entitlementListPayload },
      { skip: !isEntitlementRbacApiEnabled })
    const queryResults = useMspEntitlementListQuery(
      { params: useParams() },
      { skip: isEntitlementRbacApiEnabled ,
        selectFromResult: ({ data, ...rest }) => ({
          data,
          ...rest
        })
      })

    const subscriptionData = isEntitlementRbacApiEnabled
      ? (rbacQueryResults?.data ?? [])
      : queryResults.data?.map(response => {
        return {
          ...response,
          name: EntitlementUtil.getMspDeviceTypeText(response?.deviceType)
        }
      })

    return (
      <Loader states={[queryResults, rbacQueryState]}>
        <Table
          settingsId='msp-subscription-table'
          columns={columns}
          actions={filterByAccess(actions)}
          dataSource={subscriptionData}
          stickyHeaders={false}
          selectedFilters={defaultSelectedFilters}
          rowKey='id'
        />
        {showDialog && <SubscriptionUsageReportDialog
          visible={showDialog}
          setVisible={setShowDialog}
        />}
      </Loader>
    )
  }

  const tabs = {
    mspSubscriptions: {
      title: $t({ defaultMessage: 'MSP Subscriptions' }),
      content: <>
        <SubscriptionUtilization />
        <SubscriptionTable />
      </>,
      visible: true
    },
    assignedSubscriptions: {
      title: $t({ defaultMessage: 'MSP Assigned Subscriptions' }),
      content: <>
        {!isExtendedTrialToggleEnabled && <SubscriptionUtilization />}
        <AssignedSubscriptionTable />
      </>,
      visible: true
    },
    pendingActivations: {
      title: $t({ defaultMessage: 'Pending Activations' }),
      content: <PendingActivations />,
      visible: isPendingActivationEnabled
    },
    compliance: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Compliance' })}
        {hasAttentionNotes && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'New licensing attention notes are available' })} />}
      </UI.TabWithHint>,
      content: <LicenseCompliance
        isMsp={true}
        isExtendedTrial={tenantDetailsData?.extendedTrial && isExtendedTrialToggleEnabled}
      />,
      visible: showCompliance
    }
  }

  const onTabChange = (tab: string) => {
    setActiveTab(tab === 'assignedSubscriptions')
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Subscriptions' })}
        extra={[
          <MspTenantLink to='/msplicenses/assign'>
            <Button
              hidden={!isAssignedActive || !hasPermission}
              type='primary'>{$t({ defaultMessage: 'Assign MSP Subscriptions' })}</Button>
          </MspTenantLink>,
          !isHspSupportEnabled ? <TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink> : null
        ]}
      />
      <Tabs
        defaultActiveKey='mspSubscriptions'
        activeKey={activeTab}
        onChange={onTabChange}
      >
        {
          Object.entries(tabs).map((item) =>
            item[1].visible &&
            <Tabs.TabPane
              key={item[0]}
              tab={item[1].title}
              children={item[1].content}
            />)
        }
      </Tabs>
    </>
  )
}
