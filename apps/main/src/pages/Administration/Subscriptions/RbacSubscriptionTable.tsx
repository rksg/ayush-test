import { useState } from 'react'

import { FetchBaseQueryError }  from '@reduxjs/toolkit/query'
import { Alert, Button, Space } from 'antd'
import moment                   from 'moment'
import { IntlShape, useIntl }   from 'react-intl'

import {
  Filter,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { useIsTierAllowed, Features, TierFeatures, useIsSplitOn } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                              from '@acx-ui/formatter'
import { useGetMspProfileQuery }                                  from '@acx-ui/msp/services'
import { MSPUtils }                                               from '@acx-ui/msp/utils'
import {
  useGetEntitlementsListQuery,
  useRefreshEntitlementsMutation,
  useRbacEntitlementListQuery
} from '@acx-ui/rc/services'
import {
  EntitlementUtil,
  Entitlement,
  EntitlementDeviceType,
  sortProp,
  defaultSort,
  dateSort,
  AdminRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                from '@acx-ui/react-router-dom'
import { filterByAccess }           from '@acx-ui/user'
import { getOpsApi, noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponent'

import { entitlementRefreshPayload } from '.'

const subscriptionTypeFilterOpts = ($t: IntlShape['$t']) => [
  { key: '', value: $t({ defaultMessage: 'All Subscriptions' }) },
  {
    key: EntitlementDeviceType.ANALYTICS,
    value: EntitlementUtil.getDeviceTypeText($t, EntitlementDeviceType.ANALYTICS )
  },
  {
    key: EntitlementDeviceType.SWITCH,
    value: EntitlementUtil.getDeviceTypeText($t, EntitlementDeviceType.SWITCH )
  },
  {
    key: EntitlementDeviceType.WIFI,
    value: EntitlementUtil.getDeviceTypeText($t, EntitlementDeviceType.WIFI )
  },
  {
    key: EntitlementDeviceType.EDGE,
    value: EntitlementUtil.getDeviceTypeText($t, EntitlementDeviceType.EDGE )
  },
  {
    key: EntitlementDeviceType.LTE,
    value: EntitlementUtil.getDeviceTypeText($t, EntitlementDeviceType.LTE )
  }
]

const statusTypeFilterOpts = ($t: IntlShape['$t']) => [
  { key: '', value: $t({ defaultMessage: 'Show All' }) },
  {
    key: 'active',
    value: $t({ defaultMessage: 'Show Active' })
  },
  {
    key: 'expired',
    value: $t({ defaultMessage: 'Show Expired' })
  },
  {
    key: 'future',
    value: $t({ defaultMessage: 'Show Future' })
  },
  {
    key: 'active,future',
    value: $t({ defaultMessage: 'Show Active & Future' })
  }
]

const defaultSelectedFilters: Filter = {
  status: ['active', 'future']
}

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
  pageSize: 1000,
  sortField: 'expirationDate',
  sortOrder: 'DESC'
}

export const RbacSubscriptionTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isMspRbacMspEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
  const queryResults = useGetEntitlementsListQuery({ params },
    { skip: isEntitlementRbacApiEnabled })
  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()
  const licenseTypeOpts = subscriptionTypeFilterOpts($t)
  const mspUtils = MSPUtils()
  const { data: mspProfile } = useGetMspProfileQuery({ params, enableRbac: isMspRbacMspEnabled })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)
  const [bannerRefreshLoading, setBannerRefreshLoading] = useState<boolean>(false)

  const filters = {
    licenseType: solutionTokenFFToggled ? ['APSW', 'SLTN_TOKEN'] : ['APSW'],
    usageType: 'SELF'
  }

  const _entitlementListPayload = { ...entitlementListPayload, filters }
  const { data: rbacQueryResults } = useRbacEntitlementListQuery(
    { params: useParams(), payload: _entitlementListPayload },
    { skip: !isEntitlementRbacApiEnabled })


  const columns: TableProps<Entitlement>['columns'] = [
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
        dataIndex: 'deviceType',
        key: 'deviceType',
        filterMultiple: false,
        filterValueNullable: true,
        filterable: licenseTypeOpts.filter(o =>
          (isEdgeEnabled && o.key === EntitlementDeviceType.EDGE)
          || o.key !== EntitlementDeviceType.EDGE
        ),
        sorter: { compare: sortProp('deviceType', defaultSort) },
        render: function (data: React.ReactNode, row: Entitlement) {
          return EntitlementUtil.getDeviceTypeText($t, row.deviceType)
        }
      },
      {
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'deviceSubType',
        key: 'deviceSubType',
        sorter: { compare: sortProp('deviceSubType', defaultSort) },
        render: function (data: React.ReactNode, row: Entitlement) {
          if (row.tempLicense === true) {
            return EntitlementUtil.tempLicenseToString(true)
          } else {
            if (row.deviceType === EntitlementDeviceType.SWITCH)
              return EntitlementUtil.deviceSubTypeToText(row?.deviceSubType)
            else
              return EntitlementUtil.tempLicenseToString(false)
          }
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
    ...(isOnboardedMsp ? [
      {
        title: $t({ defaultMessage: 'Source' }),
        dataIndex: 'assignedLicense',
        key: 'assignedLicense',
        show: isOnboardedMsp,
        sorter: { compare: sortProp('assignedLicense', defaultSort) },
        render: function (data: React.ReactNode, row: Entitlement) {
          return row.assignedLicense
            ? $t({ defaultMessage: 'Assigned' }) : $t({ defaultMessage: 'Paid' })
        }
      }] : []),
    {
      title: $t({ defaultMessage: 'Starting Date' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      sorter: { compare: sortProp('effectiveDate', dateSort) },
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.effectiveDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.expirationDate)
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
        if (row.status === 'active') {
          return $t({ defaultMessage: 'Active' })
        } else if (row.status === 'future') {
          return $t({ defaultMessage: 'Future' })
        } else {
          return $t({ defaultMessage: 'Expired' })
        }
      }
    }
  ]

  const refreshFunc = async () => {
    setBannerRefreshLoading(true)
    try {
      isEntitlementRbacApiEnabled
        ? refreshEntitlement({ params, payload: entitlementRefreshPayload,
          enableRbac: isEntitlementRbacApiEnabled }).then()
        : await (refreshEntitlement)({ params }).unwrap()
      setBannerRefreshLoading(false)
    } catch (error) {
      setBannerRefreshLoading(false)
      console.log(error) // eslint-disable-line no-console
    }
  }

  const actions: TableProps<Entitlement>['actions'] = [
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
      onClick: refreshFunc
    }
  ]

  const GetStatus = (effectiveDate: string, expirationDate: string) => {
    const remainingDays = EntitlementUtil.timeLeftInDays(expirationDate)
    const isFuture = moment(new Date()).isBefore(effectiveDate)
    return remainingDays < 0 ? 'expired' : isFuture ? 'future' : 'active'
  }

  const subscriptionData = isEntitlementRbacApiEnabled
    ? (rbacQueryResults?.data?.map(response => {
      return {
        ...response,
        status: GetStatus(response?.effectiveDate, response?.expirationDate)
      }
    }).filter(data => data.deviceType !== EntitlementDeviceType.EDGE || isEdgeEnabled) ?? [])
    : queryResults.data?.map(response => {
      return {
        ...response,
        status: GetStatus(response?.effectiveDate, response?.expirationDate)
      }
    }).filter(data => data.deviceType !== EntitlementDeviceType.EDGE || isEdgeEnabled)

  const checkSubscriptionStatus = function () {
    return (queryResults?.error as FetchBaseQueryError)?.status === 417
  }

  return (
    <Loader states={checkSubscriptionStatus()
      ? [] : [queryResults]}>
      {checkSubscriptionStatus()
      && <Alert
        type='info'
        message={<><span>{$t({ defaultMessage: `At least one active subscription must be available!
        Please activate subscription and click on` })} </span>
        <Button
          type='link'
          onClick={refreshFunc}
          loading={bannerRefreshLoading}
          data-testid='bannerRefreshLink'>
          {$t({ defaultMessage: 'Refresh' })}</Button></>}
        showIcon={true}/>
      }
      <Table
        columns={columns}
        actions={filterByAccess(actions)}
        dataSource={checkSubscriptionStatus() ? [] : subscriptionData as Entitlement[]}
        selectedFilters={defaultSelectedFilters}
        rowKey='id'
      />
    </Loader>
  )
}
