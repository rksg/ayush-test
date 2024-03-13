import { useState } from 'react'

import { Tooltip }                 from 'antd'
import { Map }                     from 'immutable'
import { get, isEmpty, partition } from 'lodash'
import { defineMessage, useIntl }  from 'react-intl'

import { Tenant, defaultSort, getUserProfile, sortProp } from '@acx-ui/analytics/utils'
import { Loader, Modal, Table, TableProps, showToast }   from '@acx-ui/components'
import { DateFormatEnum, formatter }                     from '@acx-ui/formatter'
import { getIntl }                                       from '@acx-ui/utils'

import { useFetchSmartZoneListQuery, useDeleteSmartZone, OnboardedSystem } from './services'
import { Errors, Badge }                                                   from './styledComponents'

type FormattedOnboardedSystem = {
  status: string
  statusType: string
  errors: string[]
  name: string
  id: string
  addedTime:string
  formattedAddedTime: string
  lastUpdateTime: string
  canDelete: boolean,
  accountName: string
}

export const SzStateMap = {
  onboarded:
    defineMessage({ defaultMessage: 'Onboarded' }),
  offboarded:
    defineMessage({ defaultMessage: 'Offboarded' }),
  onboarding_queued:
    defineMessage({ defaultMessage: 'Onboarding: Queued' }),
  onboarding_update_sz_name:
    defineMessage({ defaultMessage: 'Onboarding: Update SZ name' }),
  onboarding_update_account_id:
    defineMessage({ defaultMessage: 'Onboarding: Update tenant association' }),
  onboarding_delete_data_connectors_and_streaming_profiles:
    defineMessage({ defaultMessage: 'Onboarding: Delete data connectors & streaming profiles' }),
  onboarding_create_data_connector:
    defineMessage({ defaultMessage: 'Onboarding: Create data connector' }),
  onboarding_create_data_streaming_profiles:
    defineMessage({ defaultMessage: 'Onboarding: Create streaming profiles' }),
  onboarding_set_hccd_for_all_zones:
    defineMessage({ defaultMessage: 'Onboarding: Enable reporting of connection failures' }),
  updating_ap_filter_list_queued:
    defineMessage({ defaultMessage: 'Assigning APs to license: Queued' }), // deprecated
  updating_ap_filter_list:
    defineMessage({ defaultMessage: 'Assigning APs to license' }), // deprecated
  updating_sz_configuration_queued:
    defineMessage({ defaultMessage: 'Updating SZ configuration: Queued' }),
  updating_sz_configuration:
    defineMessage({ defaultMessage: 'Updating SZ configuration' })
}

const ApiServiceMap = {
  licensing_api_error: defineMessage({ defaultMessage: 'License API' }),
  rbac_api_error: defineMessage({ defaultMessage: 'Access control API' }),
  sz_api_error: defineMessage({ defaultMessage: 'SmartZone API' })
}

export const sortOnboardedSystems = (
  szList: OnboardedSystem[],
  tenantId: string,
  tenantsMap: Map<string, Tenant>
) => {
  const [ currentTenantSzs, otherSzs ] = partition(szList, (sz) => sz.account_id === tenantId)
  otherSzs.sort((a, b) => (tenantsMap.getIn([a.account_id, 'name']) as string)
    .localeCompare((tenantsMap.getIn([b.account_id, 'name']) as string)))
  return currentTenantSzs.concat(otherSzs)
}

const getStatusType = (state: keyof typeof SzStateMap, errors: string[]) => {
  const ongoingWordings = ['onboarding', 'updating']
  if (!isEmpty(errors)) return 'error'
  if (ongoingWordings.some(word => state.startsWith(word))) return 'ongoing'
  if (state === 'onboarded') return 'onboarded'
  return 'offboarded'
}

const getStatusErrors = (data: OnboardedSystem, errors: string[]) => {
  const { $t } = getIntl()
  return isEmpty(errors)
    ? []
    : errors.map(error => {
      switch (error) {
        case 'poll_control_message_response_timeout':
          return $t({ defaultMessage: 'Control message response timeout' })
        case 'msg_proxy_no_data_received':
          return $t(
            { defaultMessage: 'Have not received data since {time}' },
            { time: formatter(DateFormatEnum.DateTimeFormat)(data.msg_proxy_updated_at) }
          )
        case 'sz_mgr_no_health_check_received':
          return $t(
            { defaultMessage: 'Have not received health check since {time}' },
            { time: formatter(DateFormatEnum.DateTimeFormat)(data.sz_updated_at) }
          )
        default:
          const { http_status_code: httpStatusCode, http_body: httpBody } =
            data.error_details[error as keyof typeof data.error_details] ||
            { http_status_code: null, http_body: null }
          return $t(
            // eslint-disable-next-line max-len
            { defaultMessage: '{error}: {httpBody} {isHttpStatusCode, select, true {(status code: {httpStatusCode})} other {} } ' },
            {
              error: (error in ApiServiceMap)
                ? $t(ApiServiceMap[error as keyof typeof ApiServiceMap]) : error,
              httpBody: (httpBody && !isEmpty(httpBody))
                ? (get(httpBody, 'message') || get(httpBody, 'error') || httpBody)
                : $t({ defaultMessage: 'Unknown Error' }),
              isHttpStatusCode: Boolean(httpStatusCode),
              httpStatusCode: httpStatusCode
            }
          )
      }
    })
}

export const statusTypeColorMap = {
  onboarded: '--acx-semantics-green-50',
  ongoing: '--acx-semantics-yellow-40',
  error: '--acx-semantics-red-50',
  offboarded: '--acx-neutrals-30'
}

const formatSZName = (name: string) => {
  return isEmpty(name) ? getIntl().$t({ defaultMessage: '[retrieving from SmartZone]' }) : name
}

export const errorMsgMapping = {
  CANNOT_DELETE: defineMessage({ defaultMessage: 'Offboard this system to enable deletion' }),
  SZ_NOT_FOUND: defineMessage({ defaultMessage: 'System does not exist' })
}

const formatDeleteError = ({ name }: FormattedOnboardedSystem, response: Object) => {
  const err = get(response, 'data.error', null)
  const message = (err in errorMsgMapping)
    ? errorMsgMapping[ err as keyof typeof errorMsgMapping]
    : get(response, 'message')
  return getIntl().$t({
    defaultMessage: 'Failed to delete {name}{hasMessage, select, true {: {message}} other {} }'
  }, { name, hasMessage: Boolean(message), message })
}

export const OnboardedSystems = () => {
  const { $t } = useIntl()
  const tenant = getUserProfile()
  const tenantId = tenant.accountId
  const tenantsMap = Map(tenant.tenants.map(t => [get(t, 'id'), t]))
  const { deleteSmartZone } = useDeleteSmartZone()
  const [ visible, setVisible ] = useState(false)
  const [ selected, setSelected ] = useState<FormattedOnboardedSystem>()

  const queryResults = useFetchSmartZoneListQuery(tenant.tenants.map(t => t.id), {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: sortOnboardedSystems(data || [], tenantId, tenantsMap)
        .map((data: OnboardedSystem) => {
          const stateErrors = data.state_errors
          return {
            status: $t(SzStateMap[data.state as keyof typeof SzStateMap]),
            statusType: getStatusType(data.state as keyof typeof SzStateMap, stateErrors),
            errors: getStatusErrors(data, stateErrors),
            name: formatSZName(data.device_name),
            id: data.device_id,
            addedTime: data.created_at,
            formattedAddedTime: formatter(DateFormatEnum.DateTimeFormat)(data.created_at),
            canDelete: data.can_delete,
            accountName: tenantsMap.getIn([data.account_id, 'name'])
          }
        })

    })
  })

  const ColumnHeaders: TableProps<FormattedOnboardedSystem>['columns'] = [
    {
      key: 'statusType',
      title: $t({ defaultMessage: 'Status' }),
      sorter: { compare: sortProp('status', defaultSort) },
      dataIndex: 'statusType',
      render: (_, value) =>
        <Tooltip
          key={`tooltip-${value.id}`}
          title={() => (isEmpty(value.errors))
            ? value.status
            : <>
              <div>{value.status}</div>
              <br />
              {$t({ defaultMessage: 'Errors:' })}
              <Errors>{value.errors.map(error => <li key={error}>{error}</li>)}</Errors>
            </>
          }>
          <Badge
            key={`badge-${value.id}`}
            color={
              `var(${statusTypeColorMap[value.statusType as keyof typeof statusTypeColorMap]})`}/>
        </Tooltip>,
      width: 25,
      fixed: 'left',
      filterable: [
        { key: 'onboarded', value: $t({ defaultMessage: 'Onboarded' }) },
        { key: 'ongoing', value: $t({ defaultMessage: 'Ongoing' }) },
        { key: 'error', value: $t({ defaultMessage: 'Error' }) },
        { key: 'offboarded', value: $t({ defaultMessage: 'Offboarded' }) }
      ]
    },
    {
      key: 'accountName',
      title: $t({ defaultMessage: 'Account' }),
      dataIndex: 'accountName',
      sorter: { compare: sortProp('accountName', defaultSort) },
      searchable: true
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true
    },
    {
      key: 'formattedAddedTime',
      title: $t({ defaultMessage: 'Added Time' }),
      dataIndex: 'formattedAddedTime',
      sorter: { compare: sortProp('addedTime', defaultSort) }
    }
  ]

  return <Loader states={[queryResults]}>
    <Table
      rowKey='id'
      columns={ColumnHeaders}
      dataSource={queryResults.data as FormattedOnboardedSystem[]}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: selected ? [ selected.id ] : [],
        onChange: (
          _, selectedRows: FormattedOnboardedSystem[]
        ) => setSelected(selectedRows[0])
      }}
      rowActions={[{
        label: 'Delete',
        onClick: () => setVisible(true),
        disabled: !(selected?.canDelete),
        tooltip: !(selected?.canDelete)
          ? $t(errorMsgMapping.CANNOT_DELETE) : $t({ defaultMessage: 'Delete' })
      }]}
    />
    <Modal
      title={$t({
        defaultMessage: 'Do you really want to remove {name}?' }, { name: selected?.name })}
      subTitle={$t({ defaultMessage:
          'Historical data for this system will not be viewable anymore if you confirm.' })}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={async () => {
        setVisible(false)
        await deleteSmartZone({ tenants: tenant.tenants.map(t => t.id), id: selected?.id! })
          .unwrap()
          .catch(response => {
            showToast({ type: 'error', content: formatDeleteError(selected!, response) })
          })
      }}
    ></Modal>
  </Loader>
}