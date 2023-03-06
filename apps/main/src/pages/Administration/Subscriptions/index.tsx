import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  showToast
} from '@acx-ui/components'
import {
  useGetEntitlementsListQuery,
  useRefreshEntitlementsMutation
} from '@acx-ui/rc/services'
import {
  DateFormatEnum,
  EntitlementUtil,
  Entitlement,
  EntitlementDeviceType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI                     from './styledComponent'
import { SubscriptionUtilization } from './SubscriptionUtilization'


const SubscriptionTable = () => {
  const { $t } = useIntl()
  const params = useParams()

  const queryResults = useGetEntitlementsListQuery({ params })

  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()

  const columns: TableProps<Entitlement>['columns'] = [
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
        if (row.deviceType === EntitlementDeviceType.SWITCH)
          return EntitlementUtil.deviceSubTypeToText(row?.deviceSubType)
        else
          return EntitlementUtil.tempLicenseToString(row.tempLicense === true)
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

  const actions: TableProps<Entitlement>['actions'] = [
    {
      label: $t({ defaultMessage: 'Manage Subsciptions' }),
      onClick: () => {
        window.open('https://support.ruckuswireless.com/cloud_subscriptions', '_blank')
      }
    },
    {
      label: $t({ defaultMessage: 'Refresh' }),
      onClick: async () => {
        try {
          await refreshEntitlement({ params }).unwrap()
          showToast({
            type: 'success',
            content: $t({
              defaultMessage: 'Successfully refreshed.'
            })
          })
        } catch {
          showToast({
            type: 'error',
            content: $t({
              defaultMessage: 'Failed, please try again later.'
            })
          })
        }
      }
    }
  ]

  const GetStatus = (status: String) => {
    if( status === 'VALID') {
      return $t({ defaultMessage: 'Active' })
    } else {
      return $t({ defaultMessage: 'Expired' })
    }
  }

  const subscriptionData = queryResults.data?.map(response => {
    return {
      ...response,
      name: EntitlementUtil.getDeviceTypeText($t, response?.deviceType),
      status: GetStatus(response?.status as string)
    }
  })

  return (
    <Loader states={[queryResults]}>
      <Table
        columns={columns}
        actions={actions}
        dataSource={subscriptionData}
        rowKey='id'
      />
    </Loader>
  )
}

const Subscriptions = () => {
  return (
    <UI.FullWidthSpace size='large' direction='vertical'>
      <SubscriptionUtilization />
      <SubscriptionTable />
    </UI.FullWidthSpace>
  )
}

export default Subscriptions