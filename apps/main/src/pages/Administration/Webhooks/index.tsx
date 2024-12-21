import { useEffect, useState, useCallback, Dispatch, SetStateAction } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import type { Webhook, ExtendedWebhook }                                 from '@acx-ui/analytics/components'
import { useDeleteWebhookMutation, useWebhooksQuery, useResourceGroups } from '@acx-ui/analytics/components'
import { handleError }                                                   from '@acx-ui/analytics/components'
import { defaultSort, sortProp }                                         from '@acx-ui/analytics/utils'
import {
  Loader,
  Table,
  TableProps,
  showActionModal,
  showToast
} from '@acx-ui/components'
import { get }                                                     from '@acx-ui/config'
import { SwitchScopes, WifiScopes }                                from '@acx-ui/types'
import { filterByAccess, hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

import { WebhookForm } from './WebhookForm'


type WebhookTableProps = TableProps<ExtendedWebhook>

const useWebhooksData = (selectedId?: Webhook['id'] | null) => {
  const rg = useResourceGroups()
  const webhooks = useWebhooksQuery(rg.rgMap, {
    skip: !rg.data && Boolean(get('IS_MLISA_SA')),
    selectFromResult: (response) => {
      return {
        ...response,
        webhook: selectedId
          ? _.get(_.keyBy(response.data, 'id'), selectedId)
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

interface R1WebhooksProps {
  setTitleCount: Dispatch<SetStateAction<number>>
}

const R1Webhooks = (props: R1WebhooksProps) => {
  const { setTitleCount } = props
  const { $t } = useIntl()

  // string    = existing record
  // undefined = create new webhook
  // null      = no webhook selected
  const [selectedId, setSelectedId] = useState<string | undefined | null>(null)

  const { webhooks, webhook, states } = useWebhooksData(selectedId)

  const [doDelete, response] = useDeleteWebhookMutation()

  // const [count, setCount] = useState(webhooks?.length || 0)
  useEffect(() => setTitleCount(webhooks?.length || 0), [webhooks?.length])

  // const title = defineMessage({
  //   defaultMessage: 'Webhooks {count, select, null {} other {({count})}}',
  //   description: 'Translation string - Webhooks'
  // })

  useEffect(() => {
    if (response.isSuccess) {
      showToast({ type: 'success', content: $t({ defaultMessage: 'Webhook was deleted' }) })
    }
    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        $t({ defaultMessage: 'Failed to delete webhook' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = response.isSuccess || response.isError
    if (isEnded) response.reset()
  }, [$t, response])

  const columns: WebhookTableProps['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    searchable: true,
    title: $t({ defaultMessage: 'Name' }),
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    key: 'callbackUrl',
    dataIndex: 'callbackUrl',
    searchable: true,
    title: $t({ defaultMessage: 'URL' }),
    width: 300,
    sorter: { compare: sortProp('callbackUrl', defaultSort) }
  }, ...(get('IS_MLISA_SA') ? [{
    key: 'resourceGroup',
    dataIndex: 'resourceGroup',
    searchable: true,
    title: $t({ defaultMessage: 'Resource Group' }),
    sorter: { compare: sortProp('resourceGroup', defaultSort) }
  }] : []), {
    key: 'status',
    dataIndex: 'status',
    filterKey: 'enabledStr',
    filterable: [
      { key: 'true', value: $t({ defaultMessage: 'Enabled' }) },
      { key: 'false', value: $t({ defaultMessage: 'Disabled' }) }
    ],
    title: $t({ defaultMessage: 'Status' }),
    sorter: { compare: sortProp('enabled', defaultSort) }
  }]

  const rowActions: WebhookTableProps['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE, SwitchScopes.UPDATE],
    onClick: ([webhook]) => setSelectedId(webhook.id)
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE, SwitchScopes.DELETE],
    onClick: ([webhook]) => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: webhook.name }),
      content: $t({ defaultMessage: 'Are you sure you want to delete this webhook?' }),
      onOk: () => doDelete(webhook.id)
    })
  }]

  const actions: WebhookTableProps['actions'] = [{
    label: $t({ defaultMessage: 'Create Webhook' }),
    scopeKey: [WifiScopes.CREATE, SwitchScopes.CREATE],
    onClick: () => setSelectedId(undefined)
  }]

  // const component = <Loader states={states}>
  return <Loader states={states}>
    <WebhookForm
      webhook={webhook}
      onClose={() => setSelectedId(null)}
    />
    <Table<ExtendedWebhook>
      rowKey='id'
      settingsId='webhooks-table'
      columns={columns}
      dataSource={webhooks}
      searchableWidth={450}
      actions={hasCrossVenuesPermission() ? filterByAccess(actions) : []}
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasCrossVenuesPermission() &&
        hasPermission({ permission: 'WRITE_WEBHOOKS' }) && {
        type: 'radio',
        selectedRowKeys: selectedId ? [selectedId] : []
      }}
      onDisplayRowChange={
        useCallback((dataSource: ExtendedWebhook[]) => setTitleCount(dataSource.length), [])
      }
    />
  </Loader>

  // return { title: $t(title, { count }), component }
}
export default R1Webhooks