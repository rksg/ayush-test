import { useIntl } from 'react-intl'


import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetAdminListQuery,
  useGetDelegationsQuery,
  useGetNotificationRecipientsQuery,
  useGetWebhooksQuery
} from '@acx-ui/rc/services'
import { transformDisplayNumber, useTableQuery, Webhook } from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'

export const AdminsTabTitleWithCount = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { tenantId, venueId, serialNumber } = params

  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const adminList = useGetAdminListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  const thirdPartyAdminList = useGetDelegationsQuery(
    { params }
  )

  const adminCount = adminList?.data?.length! + thirdPartyAdminList.data?.length! || 0
  return <>{$t({ defaultMessage: 'Administrators ({adminCount})' }, { adminCount })}</>
}

export const NotificationTabTitleWithCount = () => {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  const notificationList = useGetNotificationRecipientsQuery({
    params: { tenantId },
    payload: defaultPayload
  }, {
    pollingInterval: 30_000
  })

  const notificationCount = notificationList?.data?.length || 0
  return <>{$t({ defaultMessage: 'Notifications ({notificationCount})' }, { notificationCount })}</>
}

export const WebhookTabTitleWithCount = () => {
  const { $t } = useIntl()
  const isWebhookToggleEnabled = useIsSplitOn(Features.WEBHOOK_TOGGLE)

  const webhookData = useTableQuery<Webhook>({
    useQuery: useGetWebhooksQuery,
    defaultPayload: {},
    option: { skip: !isWebhookToggleEnabled }
  })

  const webhookCount = transformDisplayNumber(webhookData?.data?.totalCount)

  return <>{$t({
    defaultMessage: 'Webhooks {webhookCount, select, null {} other {({webhookCount})}}',
    description: 'Translation string - Webhooks'
  }, { webhookCount })}</>
}