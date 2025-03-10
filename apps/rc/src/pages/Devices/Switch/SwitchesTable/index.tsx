import { useRef, useState } from 'react'

import { Menu, MenuProps }        from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  Dropdown
} from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { SwitchTable, SwitchTabContext, SwitchTableRefType } from '@acx-ui/rc/components'
import {
  useGetSwitchModelListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  SwitchRbacUrlsInfo
}      from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { SwitchScopes }          from '@acx-ui/types'
import { filterByAccess }        from '@acx-ui/user'
import { getOpsApi }             from '@acx-ui/utils'

export default function useSwitchesTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ switchCount, setSwitchCount ] = useState(0)
  const switchTableRef = useRef<SwitchTableRefType>(null)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'import-from-file') {
      switchTableRef.current?.openImportDrawer()
    }
  }

  const addMenu = <Menu
    onClick={handleMenuClick}
    items={[{
      key: 'add-switch',
      label: <TenantLink to='devices/switch/add'>{$t({ defaultMessage: 'Switch' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: $t({ defaultMessage: 'Import from file' })
    }, {
      key: 'add-stack',
      label: <TenantLink to='devices/switch/stack/add'>
        {$t({ defaultMessage: 'Switch Stack' })}</TenantLink>
    }]}
  />

  const { venueFilterOptions } = useVenuesListQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data.map(v => ({ key: v.id, value: v.name })) || true
    })
  })

  const { getSwitchModelList } = useGetSwitchModelListQuery({
    params: { tenantId },
    enableRbac: isSwitchRbacEnabled,
    payload: {
      fields: ['name', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      getSwitchModelList: data?.data
        .map(v =>({ key: v.name.toUpperCase(), value: v.name.toUpperCase() })) || true
    })
  })

  const title = defineMessage({
    defaultMessage: 'Switch List {count, select, null {} other {({count})}}',
    description: 'Translation strings - Switch List'
  })

  const extra = filterByAccess([
    <Dropdown overlay={addMenu}
      scopeKey={[SwitchScopes.CREATE]}
      rbacOpsIds={[getOpsApi(SwitchRbacUrlsInfo.addSwitch)]}>{() =>
        <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
      }</Dropdown>
  ])

  const component =
    <SwitchTabContext.Provider value={{ setSwitchCount }}>
      <SwitchTable ref={switchTableRef}
        searchable={true}
        filterableKeys={{
          venueId: venueFilterOptions,
          model: getSwitchModelList
        }}
      />
    </SwitchTabContext.Provider>

  return {
    title: $t(title, { count: switchCount || 0 }),
    headerExtra: extra,
    component
  }
}