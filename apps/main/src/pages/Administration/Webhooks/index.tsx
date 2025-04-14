import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  showActionModal
} from '@acx-ui/components'
import { useDeleteWebhookMutation, useGetWebhooksQuery }                                             from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, defaultSort, sortProp, useTableQuery, Webhook, WebhookPayloadEnum } from '@acx-ui/rc/utils'
import { filterByAccess, hasCrossVenuesPermission, hasPermission }                                   from '@acx-ui/user'
import { getOpsApi }                                                                                 from '@acx-ui/utils'

import { getWebhookPayloadEnumString } from './webhookConfig'
import { WebhookForm }                 from './WebhookForm'

const R1Webhooks = () => {
  const { $t } = useIntl()

  // string    = existing record
  // undefined = create new webhook
  // null      = no webhook selected
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook>()
  const [drawerVisible, setDrawerVisible] = useState(false)

  const tableQuery = useTableQuery<Webhook>({
    useQuery: useGetWebhooksQuery,
    defaultPayload: {}
  })

  const [deleteWebhook] = useDeleteWebhookMutation()

  const isDisabledCreate = () => {
    const MAX_WEBHOOK_ALLOWED = 20
    const count = tableQuery.data?.totalCount || 0
    return count >= MAX_WEBHOOK_ALLOWED
  }

  const columns: TableProps<Webhook>['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    searchable: true,
    title: $t({ defaultMessage: 'Name' }),
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    key: 'url',
    dataIndex: 'url',
    searchable: true,
    title: $t({ defaultMessage: 'URL' }),
    width: 300,
    sorter: { compare: sortProp('url', defaultSort) }
  }, {
    key: 'payload',
    dataIndex: 'payload',
    searchable: true,
    title: $t({ defaultMessage: 'Payload' }),
    width: 300,
    sorter: { compare: sortProp('payload', defaultSort) },
    render: function (_, row) {
      return getWebhookPayloadEnumString($t,
        WebhookPayloadEnum[row.payload as keyof typeof WebhookPayloadEnum])
    }
  },
  {
    key: 'status',
    dataIndex: 'status',
    filterKey: 'status',
    filterable: [
      { key: 'ON', value: $t({ defaultMessage: 'Enabled' }) },
      { key: 'OFF', value: $t({ defaultMessage: 'Disabled' }) }
    ],
    title: $t({ defaultMessage: 'Status' }),
    sorter: { compare: sortProp('status', defaultSort) },
    render: function (_, row) {
      return row.status === 'ON'
        ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
    }
  }]

  const rowActions: TableProps<Webhook>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateWebhook)],
    onClick: ([webhook]) => {
      setSelectedWebhook(webhook)
      setDrawerVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteWebhook)],
    onClick: ([webhook], clearSelection) => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: webhook.name }),
      content: $t({ defaultMessage: 'Are you sure you want to delete this webhook?' }),
      onOk: () => {
        deleteWebhook({ params: { webhookId: webhook.id } })
          .then(clearSelection)
      }
    })
  }]

  const actions: TableProps<Webhook>['actions'] = [{
    label: $t({ defaultMessage: 'Create Webhook' }),
    disabled: isDisabledCreate(),
    rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.addWebhook)],
    onClick: () => {
      setSelectedWebhook(undefined)
      setDrawerVisible(true)
    }
  }]

  return <Loader states={[tableQuery]}>
    {drawerVisible && <WebhookForm
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      selected={selectedWebhook}
      webhookData={tableQuery.data?.data ?? []}
    />}
    <Table
      rowKey='id'
      columns={columns}
      dataSource={tableQuery.data?.data}
      actions={hasCrossVenuesPermission() ? filterByAccess(actions) : []}
      rowActions={rowActions}
      rowSelection={hasCrossVenuesPermission() &&
        hasPermission({ permission: 'WRITE_WEBHOOKS' }) && {
        type: 'radio'
      }}
      data-testid='WebhooksTable'
    />
  </Loader>
}
export default R1Webhooks