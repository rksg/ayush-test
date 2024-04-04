import { useState } from 'react'

import { FetchBaseQueryError }  from '@reduxjs/toolkit/query'
import { Alert, Button, Space } from 'antd'
import moment                   from 'moment'
import { useIntl }              from 'react-intl'

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

import * as UI from '../styledComponent'

const ActivatedPurchasesTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)

  const queryResults = useGetEntitlementsListQuery({ params })
  const isNewApi = AdministrationUrlsInfo.refreshLicensesData.newApi
  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()
  const [ internalRefreshEntitlement ] = useInternalRefreshEntitlementsMutation()
  //   const licenseTypeOpts = subscriptionTypeFilterOpts($t)
  const mspUtils = MSPUtils()
  const { data: mspProfile } = useGetMspProfileQuery({ params })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)
  const [bannerRefreshLoading, setBannerRefreshLoading] = useState<boolean>(false)


  const columns: TableProps<Entitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
      dataIndex: 'sku',
      key: 'sku',
      filterable: true,
      sorter: { compare: sortProp('sku', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Part Number Code' }),
      dataIndex: 'deviceSubType',
      key: 'deviceSubType',
      filterable: true,
      sorter: { compare: sortProp('deviceSubType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Part Description' }),
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
      title: $t({ defaultMessage: 'Part Number Qty' }),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Start Date' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      sorter: { compare: sortProp('effectiveDate', dateSort) },
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.effectiveDate)
      }
    },
    {
      title: $t({ defaultMessage: 'End Date' }),
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
          EntitlementUtil.timeLeftValues(remainingDays)
        }</TimeLeftWrapper>
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

const ActivatedPurchases = () => {
  return (
    <SpaceWrapper fullWidth size='large' direction='vertical'>
      <ActivatedPurchasesTable />
    </SpaceWrapper>
  )
}

export default ActivatedPurchases
