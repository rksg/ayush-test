import { useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Alert, Button }       from 'antd'
import moment                  from 'moment'
import { IntlShape, useIntl }  from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  showToast
} from '@acx-ui/components'
import { get }                             from '@acx-ui/config'
import { useIsTierAllowed, TierFeatures }  from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }       from '@acx-ui/formatter'
import { useGetMspProfileQuery }           from '@acx-ui/msp/services'
import { MSPUtils }                        from '@acx-ui/msp/utils'
import { SpaceWrapper }                    from '@acx-ui/rc/components'
import {
  useGetEntitlementsListQuery,
  useRefreshEntitlementsMutation,
  useInternalRefreshEntitlementsMutation
} from '@acx-ui/rc/services'
import {
  EntitlementUtil,
  Entitlement,
  EntitlementDeviceType,
  AdministrationUrlsInfo,
  sortProp,
  defaultSort,
  dateSort
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

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

const PendingActivationsTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)

  const queryResults = useGetEntitlementsListQuery({ params })
  const isNewApi = AdministrationUrlsInfo.refreshLicensesData.newApi
  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()
  const [ internalRefreshEntitlement ] = useInternalRefreshEntitlementsMutation()
  const licenseTypeOpts = subscriptionTypeFilterOpts($t)
  const mspUtils = MSPUtils()
  const { data: mspProfile } = useGetMspProfileQuery({ params })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)
  const [bannerRefreshLoading, setBannerRefreshLoading] = useState<boolean>(false)


  const columns: TableProps<Entitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'Order Date' }),
      dataIndex: 'sku',
      key: 'sku',
      sorter: { compare: sortProp('sku', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
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
      title: $t({ defaultMessage: 'Part Number' }),
      dataIndex: 'deviceSubType',
      key: 'deviceSubType',
      filterable: true,
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
    },
    {
      title: $t({ defaultMessage: 'Part Number Description' }),
      dataIndex: 'assignedLicense',
      key: 'assignedLicense',
      show: isOnboardedMsp,
      sorter: { compare: sortProp('assignedLicense', defaultSort) },
      render: function (data: React.ReactNode, row: Entitlement) {
        return row.assignedLicense
          ? $t({ defaultMessage: 'Assigned' }) : $t({ defaultMessage: 'Paid' })
      }
    },
    {
      title: $t({ defaultMessage: 'Quantity' }),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Subscription Term' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      sorter: { compare: sortProp('effectiveDate', dateSort) },
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.effectiveDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Activation Period Ends on' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: { compare: sortProp('expirationDate', dateSort) },
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.expirationDate)
      }
    }
  ]

  const refreshFunc = async () => {
    setBannerRefreshLoading(true)
    try {
      await (isNewApi ? refreshEntitlement : internalRefreshEntitlement)({ params }).unwrap()
      if (isNewApi === false) {
        showToast({
          type: 'success',
          content: $t({
            defaultMessage: 'Successfully refreshed.'
          })
        })
      }
      setBannerRefreshLoading(false)
    } catch (error) {
      setBannerRefreshLoading(false)
      console.log(error) // eslint-disable-line no-console
    }
  }

  const actions: TableProps<Entitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Manage Subsciptions' }),
      onClick: () => {
        const licenseUrl = get('MANAGE_LICENSES')
        window.open(licenseUrl, '_blank')
      }
    },
    {
      label: $t({ defaultMessage: 'Refresh' }),
      onClick: refreshFunc
    }
  ]

  const GetStatus = (effectiveDate: string, expirationDate: string) => {
    const remainingDays = EntitlementUtil.timeLeftInDays(expirationDate)
    const isFuture = moment(new Date()).isBefore(effectiveDate)
    return remainingDays < 0 ? 'expired' : isFuture ? 'future' : 'active'
  }

  const subscriptionData = queryResults.data?.map(response => {
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
        dataSource={checkSubscriptionStatus() ? [] : subscriptionData}
        rowKey='id'
      />
    </Loader>
  )
}

const PendingActivations = () => {
  return (
    <SpaceWrapper fullWidth size='large' direction='vertical'>
      <PendingActivationsTable />
    </SpaceWrapper>
  )
}

export default PendingActivations
