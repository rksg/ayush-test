import { useEffect, useRef, useState } from 'react'

import { Menu, MenuProps }        from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  Dropdown
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { ApTable, ApTableRefType, ApsTabContext, groupedFields, useApGroupsFilterOpts } from '@acx-ui/rc/components'
import {
  useNewApListQuery,
  useApListQuery
} from '@acx-ui/rc/services'
import { usePollingTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }           from '@acx-ui/react-router-dom'
import { WifiScopes }           from '@acx-ui/types'

const apsCountQueryPayload = {
  fields: ['serialNumber', 'name'],
  groupByFields: groupedFields
}

const useApsCount = (): [number, React.Dispatch<React.SetStateAction<number>>] => {
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const [ apsCount, setApsCount ] = useState(0)

  const nonRbacQuery = usePollingTableQuery({
    useQuery: useApListQuery,
    defaultPayload: apsCountQueryPayload,
    option: { skip: isUseWifiRbacApi }
  })

  const rbacQuery = usePollingTableQuery({
    useQuery: useNewApListQuery,
    defaultPayload: apsCountQueryPayload,
    option: { skip: !isUseWifiRbacApi }
  })

  useEffect(() => {
    setApsCount(isUseWifiRbacApi
      ? rbacQuery.data?.totalCount!
      : nonRbacQuery.data?.totalCount!
    )
  }, [isUseWifiRbacApi, nonRbacQuery.data, rbacQuery.data])

  return [apsCount, setApsCount]
}

export default function useApsTable () {
  const { $t } = useIntl()
  const apTableRef = useRef<ApTableRefType>(null)
  const [apsCount, setApsCount] = useApsCount()
  const enabledUXOptFeature = useIsSplitOn(Features.UX_OPTIMIZATION_FEATURE_TOGGLE)

  const apgroupFilterOptions = useApGroupsFilterOpts()

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'import-from-file') {
      apTableRef.current?.openImportDrawer()
    }
  }

  const addMenu = <Menu
    onClick={handleMenuClick}
    items={[{
      key: 'ap',
      label: <TenantLink to='devices/wifi/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: $t({ defaultMessage: 'Import APs' })
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  const title = defineMessage({
    defaultMessage: 'AP List {count, select, null {} other {({count})}}',
    description: 'Translation strings - AP List'
  })

  const extra = [
    <Dropdown
      scopeKey={[WifiScopes.CREATE]}
      overlay={addMenu}>{() =>
        <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
      }
    </Dropdown>
  ]

  const component =
    <ApsTabContext.Provider value={{ setApsCount }}>
      <ApTable ref={apTableRef}
        searchable={true}
        filterables={{
          deviceGroupId: apgroupFilterOptions
        }}
        rowSelection={{
          type: 'checkbox'
        }}
        filterPersistence={enabledUXOptFeature}
      />
    </ApsTabContext.Provider>

  return {
    title: $t(title, { count: apsCount || 0 }),
    headerExtra: extra,
    component
  }
}
