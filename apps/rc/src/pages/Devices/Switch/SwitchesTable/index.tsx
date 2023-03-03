import { useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Menu, MenuProps }     from 'antd'
import { useIntl }             from 'react-intl'

import { Button, Dropdown, PageHeader }                  from '@acx-ui/components'
import { hasAccesses }                                   from '@acx-ui/rbac'
import { ImportFileDrawer, CsvSize, SwitchTable }        from '@acx-ui/rc/components'
import { useImportSwitchesMutation, useVenuesListQuery } from '@acx-ui/rc/services'
import { TenantLink, useParams }                         from '@acx-ui/react-router-dom'


export default function SwitchesTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ importVisible, setImportVisible] = useState(false)

  const [ importCsv, importResult ] = useImportSwitchesMutation()

  const importTemplateLink = 'assets/templates/switches_import_template.csv'

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

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Switch' })}
        extra={hasAccesses([
          <Dropdown overlay={addMenu}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
        ])}
      />
      <ImportFileDrawer type='Switch'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={50}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData)=>{
          importCsv({ params: { tenantId }, payload: formData })
        }}
        onClose={()=>setImportVisible(false)}
      />
      <SwitchTable
        searchable={true}
        filterableKeys={{
          venueId: venueFilterOptions
        }}
      />
    </>
  )
}


