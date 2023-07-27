import { Space }              from 'antd'
import moment                 from 'moment-timezone'
import { IntlShape, useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  showToast
} from '@acx-ui/components'
import { get }                             from '@acx-ui/config'
import { useIsTierAllowed, Features }      from '@acx-ui/feature-toggle'
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

import * as UI                from './styledComponent'
import { SubscriptionHeader } from './SubscriptionHeader'

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
  }
]

const SubscriptionTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)

  const queryResults = useGetEntitlementsListQuery({ params })
  const isNewApi = AdministrationUrlsInfo.getEntitlementSummary.newApi
  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()
  const [ internalRefreshEntitlement ] = useInternalRefreshEntitlementsMutation()
  const licenseTypeOpts = subscriptionTypeFilterOpts($t)
  const mspUtils = MSPUtils()
  const { data: mspProfile } = useGetMspProfileQuery({ params })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)

  const columns: TableProps<Entitlement>['columns'] = [
    {
      title: $t({ defaultMessage: 'Subscription' }),
      dataIndex: 'deviceType',
      key: 'deviceType',
      fixed: 'left',
      filterMultiple: false,
      filterValueNullable: true,
      filterable: licenseTypeOpts.filter(o =>
        (isEdgeEnabled && o.key === EntitlementDeviceType.EDGE)
        || o.key !== EntitlementDeviceType.EDGE
      ),
      sorter: { compare: sortProp('deviceType', defaultSort) },
      render: function (_, row) {
        return EntitlementUtil.getDeviceTypeText($t, row.deviceType)
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'deviceSubType',
      key: 'deviceSubType',
      sorter: { compare: sortProp('deviceSubType', defaultSort) },
      render: function (_, row) {
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
      title: $t({ defaultMessage: 'Device Count' }),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    // ...(isOnboardedMsp ? [
    {
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'assignedLicense',
      key: 'assignedLicense',
      show: isOnboardedMsp,
      sorter: { compare: sortProp('assignedLicense', defaultSort) },
      render: function (_, row) {
        return row.assignedLicense
          ? $t({ defaultMessage: 'Assigned' }) : $t({ defaultMessage: 'Purchased' })
      }
    },
    // ] : []),
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
        return row.status === 'active'
          ? $t({ defaultMessage: 'Active' })
          : $t({ defaultMessage: 'Expired' })
      }
    }
  ]

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
      onClick: async () => {
        try {
          await (isNewApi ? refreshEntitlement : internalRefreshEntitlement)({ params }).unwrap()
          showToast({
            type: 'success',
            content: $t({
              defaultMessage: 'Successfully refreshed.'
            })
          })
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    }
  ]

  const GetStatus = (expirationDate: string) => {
    const isValid = moment(expirationDate).isAfter(Date.now())
    return isValid ? 'active' : 'expired'
  }

  const subscriptionData = queryResults.data?.map(response => {
    return {
      ...response,
      status: GetStatus(response?.expirationDate)
    }
  }).filter(data => data.deviceType !== EntitlementDeviceType.EDGE || isEdgeEnabled)

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columns}
        actions={filterByAccess(actions)}
        dataSource={subscriptionData}
        rowKey='id'
      />
    </Loader>
  )
}

const Subscriptions = () => {
  return (
    <SpaceWrapper fullWidth size='large' direction='vertical'>
      <SubscriptionHeader />
      <SubscriptionTable />
    </SpaceWrapper>
  )
}

export default Subscriptions
