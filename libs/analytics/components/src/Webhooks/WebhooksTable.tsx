import { useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  showActionModal
} from '@acx-ui/components'
import { get } from '@acx-ui/config'

import { useDeleteWebhookMutation, useWebhooksQuery, useResourceGroups, handleError } from './services'
import { WebhookForm }                                                                from './WebhookForm'

import type { Webhook } from './services'

type ExtendedWebhook = Webhook & {
  resourceGroup: string
  status: string
  enabledStr: string
}
type WebhookTableProps = TableProps<ExtendedWebhook>

const useWebhooks = (selectedId?: Webhook['id'] | null) => {
  const { $t } = useIntl()
  const rg = useResourceGroups()
  const webhooks = useWebhooksQuery(undefined, {
    skip: !rg.data && Boolean(get('IS_MLISA_SA')),
    selectFromResult: (response) => {
      const data = response.data?.map((item) => ({
        ...item,
        resourceGroup: rg.rgMap[item.resourceGroupId],
        enabledStr: String(item.enabled),
        status: item.enabled
          ? $t({ defaultMessage: 'Enabled' })
          : $t({ defaultMessage: 'Disabled' })
      }))
      return {
        ...response,
        data,
        webhook: selectedId
          ? _.get(_.keyBy(data, 'id'), selectedId)
          : (selectedId as null | undefined)
      }
    }
  })
  return {
    webhooks: webhooks.data,
    webhook: webhooks.webhook,
    states: [rg, webhooks]
  }
}

export default function WebhooksTable () {
  const { $t } = useIntl()

  // string    = existing record
  // undefined = create new webhook
  // null      = no webhook selected
  const [selectedId, setSelectedId] = useState<string | undefined | null>(null)

  const { webhook, webhooks, states } = useWebhooks(selectedId)
  const [doDelete, deleteResponse] = useDeleteWebhookMutation()

  useEffect(() => {
    if (!deleteResponse.isError) return

    handleError(
      deleteResponse.error as FetchBaseQueryError,
      $t({ defaultMessage: 'Failed to delete webhook' })
    )
  }, [$t, deleteResponse])

  const columns: WebhookTableProps['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    searchable: true,
    title: $t({ defaultMessage: 'Name' })
  }, {
    key: 'callbackUrl',
    dataIndex: 'callbackUrl',
    searchable: true,
    title: $t({ defaultMessage: 'URL' }),
    width: 300
  }, ...(get('IS_MLISA_SA') ? [{
    key: 'resourceGroup',
    dataIndex: 'resourceGroup',
    searchable: true,
    title: $t({ defaultMessage: 'Resource Group' })
  }] : []), {
    key: 'status',
    dataIndex: 'status',
    filterKey: 'enabledStr',
    filterable: [
      { key: 'true', value: $t({ defaultMessage: 'Enabled' }) },
      { key: 'false', value: $t({ defaultMessage: 'Disabled' }) }
    ],
    title: $t({ defaultMessage: 'Status' })
  }]

  const rowActions: WebhookTableProps['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([webhook]) => setSelectedId(webhook.id)
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([webhook]) => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Are you sure you want to delete this webhook?' }),
      onOk: () => doDelete(webhook.id)
    })
  }]

  const actions: WebhookTableProps['actions'] = [{
    label: $t({ defaultMessage: 'Create Webhook' }),
    onClick: () => setSelectedId(undefined)
  }]

  return (
    <Loader states={states}>
      <WebhookForm
        webhook={webhook}
        onClose={() => setSelectedId(null)}
      />
      <Table<ExtendedWebhook>
        {...{ actions, columns, rowActions }}
        rowKey='id'
        dataSource={webhooks}
        searchableWidth={450}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedId ? [selectedId] : []
        }}
      />
    </Loader>
  )
}
