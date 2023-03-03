import { useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Menu, MenuProps }     from 'antd'
import { useIntl }             from 'react-intl'

import {
  Button,
  Dropdown,
  PageHeader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { hasAccesses }                                                   from '@acx-ui/rbac'
import { ApTable, CsvSize, ImportFileDrawer }                            from '@acx-ui/rc/components'
import { useApGroupsListQuery, useImportApMutation, useVenuesListQuery } from '@acx-ui/rc/services'
import { TenantLink, useParams }                                         from '@acx-ui/react-router-dom'

export default function ApsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ importVisible, setImportVisible ] = useState(false)

  const { venueFilterOptions } = useVenuesListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'country', 'latitude', 'longitude', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  } }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
    })
  })

  const { apgroupFilterOptions } = useApGroupsListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'venueId', 'clients', 'networks', 'venueName', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC',
    filters: { isDefault: [false] }
  } }, {
    selectFromResult: ({ data }) => ({
      apgroupFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
    })
  })

  const [ importCsv, importResult ] = useImportApMutation()

  const apGpsFlag = useIsSplitOn(Features.AP_GPS)
  const importTemplateLink = apGpsFlag ?
    'assets/templates/aps_import_template_with_gps.csv' :
    'assets/templates/aps_import_template.csv'

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
      key: 'ap',
      label: <TenantLink to='devices/wifi/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: $t({ defaultMessage: 'Import from file' })
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Wi-Fi' })}
        extra={hasAccesses([
          <Dropdown overlay={addMenu}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
        ])}
      />
      <ApTable
        searchable={true}
        filterables={{
          venueId: venueFilterOptions,
          deviceGroupId: apgroupFilterOptions
        }}
        rowSelection={{
          type: 'checkbox'
        }}
      />
      <ImportFileDrawer type='AP'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData)=>{
          importCsv({ params: { tenantId }, payload: formData })
        }}
        onClose={()=>setImportVisible(false)}/>
    </>
  )
}
