import { useIntl } from 'react-intl'


import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetAdminListPaginatedQuery,
  useGetDelegationsQuery,
  useGetNotificationRecipientsPaginatedQuery,
  useGetNotificationRecipientsQuery,
  useGetWebhooksQuery
} from '@acx-ui/rc/services'
import { transformDisplayNumber, Webhook } from '@acx-ui/rc/utils'
import { useParams }                       from '@acx-ui/react-router-dom'
import { useTableQuery }                   from '@acx-ui/utils'

export const AdminsTabTitleWithCount = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { tenantId, venueId, serialNumber } = params

  const defaultPayload = {
    page: 0,
    pageSize: 10,
    sortField: '',
    sortOrder: 'ASC',
    searchTargetFields: ['name', 'email'],
    searchString: '',
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const adminList = useGetAdminListPaginatedQuery({
    params: { tenantId },
    payload: defaultPayload
  }, {
    pollingInterval: 30_000
  })

  const thirdPartyAdminList = useGetDelegationsQuery(
    { params }
  )

  const adminCount = (adminList?.data?.totalCount || 0) + (thirdPartyAdminList.data?.length || 0)
  return <>{$t({ defaultMessage: 'Administrators ({adminCount})' }, { adminCount })}</>
}

export const NotificationTabTitleWithCount = () => {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  const notificationsPaginatedListToggle =
    useIsSplitOn(Features.MSPSERVICE_NOTIFICATION_ACCOUNTS_SEARCH_TOGGLE)

  const paginatedDefaultPayload = {
    page: 0,
    pageStartZero: true,
    pageSize: 10,
    sortField: 'name',
    sortOrder: 'ASC',
    searchTargetFields: [
      'name'
    ],
    searchString: '',
    filters: {}
  }

  const notificationList = useGetNotificationRecipientsQuery({
    params: { tenantId },
    payload: defaultPayload
  }, {
    skip: notificationsPaginatedListToggle,
    pollingInterval: 30_000
  })

  const tableResult = useGetNotificationRecipientsPaginatedQuery({
    params: { tenantId },
    defaultPayload: paginatedDefaultPayload
  }, { skip: !notificationsPaginatedListToggle })

  const notificationCount = (notificationsPaginatedListToggle
    ? tableResult.data?.totalCount
    : notificationList?.data?.length) || 0

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