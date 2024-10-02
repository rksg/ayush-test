import { useEffect, useState, useCallback } from 'react'

import { FetchBaseQueryError }    from '@reduxjs/toolkit/query'
import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, sortProp } from '@acx-ui/analytics/utils'
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

import { useDeleteWebhookMutation, useWebhooksQuery, useResourceGroups, handleError } from './services'
import { ApplicationTokenForm }                                                                from './ApplicationTokenForm'

import type { ApplicationToken, Webhook, ExtendedWebhook } from './services'
import { applicationTokens, webhooks } from './__fixtures__'

type ApplicationTokenTableProps = TableProps<ApplicationToken>

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

export const useApplicationTokens = () => {
  const { $t } = useIntl()

  // string    = existing record
  // undefined = create new webhook
  // null      = no webhook selected
  const [selectedId, setSelectedId] = useState<string | undefined | null>(null)

  const { webhook, states } = useWebhooksData(selectedId)

  const [doDelete, response] = useDeleteWebhookMutation()

  const [count, setCount] = useState(applicationTokens?.length || 0)
  useEffect(() => setCount(applicationTokens?.length || 0), [applicationTokens?.length])

  const title = defineMessage({
    defaultMessage: 'Application Tokens {count, select, null {} other {({count})}}',
    description: 'Translation string - Application Tokens'
  })

  useEffect(() => {
    if (response.isSuccess) {
      showToast({ type: 'success', content: $t({ defaultMessage: 'Application token was deleted' }) })
    }
    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        $t({ defaultMessage: 'Failed to delete application token' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = response.isSuccess || response.isError
    if (isEnded) response.reset()
  }, [$t, response])

  const columns: ApplicationTokenTableProps['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    searchable: true,
    title: $t({ defaultMessage: 'Name' }),
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    key: 'clientId',
    dataIndex: 'clientId',
    searchable: true,
    title: $t({ defaultMessage: 'Client ID' }),
    sorter: { compare: sortProp('clientId', defaultSort) }
  }, {
    key: 'clientSecret',
    dataIndex: 'clientSecret',
    searchable: true,
    title: $t({ defaultMessage: 'Client Secret' }),
    sorter: { compare: sortProp('clientSecret', defaultSort) }
  }]

  const rowActions: ApplicationTokenTableProps['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE, SwitchScopes.UPDATE],
    onClick: ([webhook]) => setSelectedId(webhook.id)
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE, SwitchScopes.DELETE],
    onClick: ([webhook]) => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: webhook.name }),
      content: $t({ defaultMessage: 'Are you sure you want to delete this application token?' }),
      onOk: () => doDelete(webhook.id)
    })
  }]

  const actions: ApplicationTokenTableProps['actions'] = [{
    label: $t({ defaultMessage: 'Create Application Token' }),
    scopeKey: [WifiScopes.CREATE, SwitchScopes.CREATE],
    onClick: () => setSelectedId(undefined)
  }]

  const component = <Loader states={states}>
    <ApplicationTokenForm
      webhook={webhook}
      onClose={() => setSelectedId(null)}
    />
    <Table<ApplicationToken>
      rowKey='id'
      settingsId='application-tokens-table'
      columns={columns}
      dataSource={applicationTokens}
      searchableWidth={450}
      actions={hasCrossVenuesPermission() ? filterByAccess(actions) : []}
      rowActions={filterByAccess(rowActions)}
      rowSelection={hasCrossVenuesPermission() &&
      {
        type: 'radio',
        selectedRowKeys: selectedId ? [selectedId] : []
      }}
      onDisplayRowChange={
        useCallback((dataSource: ApplicationToken[]) => setCount(dataSource.length), [])
      }
    />
  </Loader>

  return { title: $t(title, { count }), component }
}
