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
import { CopyOutlined }                             from '@acx-ui/icons-new'
import { SwitchScopes, WifiScopes }                 from '@acx-ui/types'
import { filterByAccess, hasCrossVenuesPermission } from '@acx-ui/user'

import { handleError }                         from '../services'
import { TransparentButton, Row, SecretInput } from '../styledComponents'
import { Label }                               from '../styledComponents'

import { ApplicationTokenForm }                                         from './ApplicationTokenForm'
import { useApplicationTokensQuery, useDeleteApplicationTokenMutation } from './services'

import type { ApplicationToken } from './services'


type ApplicationTokenTableProps = TableProps<ApplicationToken>

const useApplicationTokensData = (selectedId?: ApplicationToken['id'] | null) => {
  const applicationTokens = useApplicationTokensQuery()
  return {
    applicationTokens: applicationTokens.data,
    applicationToken: selectedId
      ? _.get(_.keyBy(applicationTokens.data, 'id'), selectedId)
      : (selectedId as null | undefined),
    states: [applicationTokens]
  }
}

export const useApplicationTokens = () => {
  const { $t } = useIntl()

  // string    = existing record
  // undefined = create new application token
  // null      = no application token selected
  const [selectedId, setSelectedId] = useState<string | undefined | null>(null)

  const { applicationTokens, applicationToken, states } = useApplicationTokensData(selectedId)

  const [doDelete, response] = useDeleteApplicationTokenMutation()

  const [count, setCount] = useState(applicationTokens?.length || 0)
  useEffect(() => setCount(applicationTokens?.length || 0), [applicationTokens?.length])

  const title = defineMessage({
    defaultMessage: 'Application Tokens {count, select, null {} other {({count})}}',
    description: 'Translation string - Application Tokens'
  })

  useEffect(() => {
    if (response.isSuccess) {
      showToast({
        type: 'success',
        content: $t({ defaultMessage: 'Application token was deleted' })
      })
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
    title: $t({ defaultMessage: 'Token Name' }),
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    key: 'clientId',
    dataIndex: 'clientId',
    searchable: true,
    title: $t({ defaultMessage: 'Client ID' }),
    sorter: { compare: sortProp('clientId', defaultSort) },
    render: function (_, row) {
      return <Row>
        <Label>{row.clientId}</Label>
        <TransparentButton
          data-testid={'copy'}
          type='text'
          icon={<CopyOutlined />}
          onClick={() =>
            navigator.clipboard.writeText(row.clientId ?? '')
          }
        />
      </Row>
    }
  }, {
    key: 'clientSecret',
    dataIndex: 'clientSecret',
    searchable: true,
    title: $t({ defaultMessage: 'Client Secret' }),
    sorter: { compare: sortProp('clientSecret', defaultSort) },
    render: function (_, row) {
      return <Row>
        <SecretInput
          bordered={false}
          value={row.clientSecret}
        />
        <TransparentButton
          data-testid={'copy'}
          type='text'
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(row.clientSecret ?? '')
          }}
        />
      </Row>
    }
  }]

  const rowActions: ApplicationTokenTableProps['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: [WifiScopes.UPDATE, SwitchScopes.UPDATE],
    onClick: ([applicationToken]) => setSelectedId(applicationToken.id)
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [WifiScopes.DELETE, SwitchScopes.DELETE],
    onClick: ([applicationToken]) => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: applicationToken.name }),
      content: $t({ defaultMessage: 'Are you sure you want to delete this application token?' }),
      onOk: () => {
        doDelete(applicationToken)
      }
    })
  }]

  const actions: ApplicationTokenTableProps['actions'] = [{
    label: $t({ defaultMessage: 'Create Application Token' }),
    scopeKey: [WifiScopes.CREATE, SwitchScopes.CREATE],
    onClick: () => setSelectedId(undefined)
  }]

  const component = <Loader states={states}>
    <ApplicationTokenForm
      applicationToken={applicationToken}
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
