import { useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Menu, MenuProps }     from 'antd'
import { useIntl }             from 'react-intl'

import {
  Button,
  Dropdown,
  PageHeader
} from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { ApTable, CsvSize, ImportCsvDrawer } from '@acx-ui/rc/components'
import { useImportApMutation }               from '@acx-ui/rc/services'
import { TenantLink, useParams }             from '@acx-ui/react-router-dom'
import { notAvailableMsg }                   from '@acx-ui/utils'

export default function ApsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ importVisible, setImportVisible ] = useState(false)

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
      label: $t({ defaultMessage: 'Import from file' }),
      title: $t(notAvailableMsg),
      disabled: !useIsSplitOn(Features.DEVICES)
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'WiFi' })}
        extra={[
          <Dropdown overlay={addMenu} key='addMenu'>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
        ]}
      />
      <ApTable
        rowSelection={{
          type: 'checkbox'
        }}
      />
      <ImportCsvDrawer type='AP'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        temlateLink={importTemplateLink}
        visible={importVisible}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData)=>{
          importCsv({ params: { tenantId }, payload: formData })
        }}
        onClose={()=>setImportVisible(false)}/>
    </>
  )
}
