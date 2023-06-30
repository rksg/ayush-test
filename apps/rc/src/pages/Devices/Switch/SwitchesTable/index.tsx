import { useEffect, useState } from 'react'

import { FetchBaseQueryError }    from '@reduxjs/toolkit/query/react'
import { Menu, MenuProps }        from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Button, Dropdown }                                                               from '@acx-ui/components'
import { ImportFileDrawer, CsvSize, SwitchTable, SwitchTabContext, defaultSwitchPayload } from '@acx-ui/rc/components'
import {
  useGetSwitchModelListQuery,
  useImportSwitchesMutation,
  useSwitchListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { usePollingTableQuery }  from '@acx-ui/utils'

export default function useSwitchesTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ importVisible, setImportVisible] = useState(false)
  const [ switchCount, setSwitchCount ] = useState(0)
  const [ importCsv, importResult ] = useImportSwitchesMutation()

  const importTemplateLink = 'assets/templates/switches_import_template.csv'

  const tableQuery = usePollingTableQuery({
    useQuery: useSwitchListQuery,
    defaultPayload: {
      ...defaultSwitchPayload
    },
    search: {
      searchTargetFields: defaultSwitchPayload.searchTargetFields
    }
  })

  useEffect(() => {
    setSwitchCount(tableQuery.data?.totalCount!)
  }, [tableQuery.data])

  useEffect(()=>{
    if (importResult.isSuccess) {
      setImportVisible(false)
    }
  },[importResult])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'import-from-file') {
      setImportVisible(true)
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
    params: { tenantId }, payload: {
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

  const extra = [
    <Dropdown overlay={addMenu}>{() =>
      <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
    }</Dropdown>
  ]

  const component = <>
    <ImportFileDrawer type='Switch'
      title={$t({ defaultMessage: 'Import from file' })}
      maxSize={CsvSize['5MB']}
      maxEntries={50}
      acceptType={['csv']}
      templateLink={importTemplateLink}
      visible={importVisible}
      isLoading={importResult.isLoading}
      importError={importResult.error as FetchBaseQueryError}
      importRequest={async (formData)=>{
        await importCsv({ params: { tenantId }, payload: formData }
        ).unwrap().then(() => {
          setImportVisible(false)
        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
      }}
      onClose={()=>setImportVisible(false)}
    />
    <SwitchTabContext.Provider value={{ setSwitchCount }}>
      <SwitchTable
        searchable={true}
        filterableKeys={{
          venueId: venueFilterOptions,
          model: getSwitchModelList
        }}
      />
    </SwitchTabContext.Provider>
  </>

  return {
    title: $t(title, { count: switchCount || 0 }),
    headerExtra: extra,
    component
  }
}
