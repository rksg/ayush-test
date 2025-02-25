import { useState } from 'react'

import {  useIntl } from 'react-intl'

import { Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import {
  useSearchPersonaListQuery,
  useAddUnitLinkedIdentityMutation
} from '@acx-ui/rc/services'
import {
  Persona,
  useTableQuery
} from '@acx-ui/rc/utils'

export interface PropertyUnitIdentityDrawerProps {
  visible: boolean,
  onClose: () => void,
  groupId?: string,
  venueId?: string,
  unitId?: string
}

export function PropertyUnitIdentityDrawer (props: PropertyUnitIdentityDrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, groupId, venueId, unitId } = props
  const settingsId = 'property-units-identity-table'

  const [selectedRows, setSelectedRows] = useState<Persona[]>([])
  const [addUnitLinkedIdentity] = useAddUnitLinkedIdentityMutation()

  const clearSelectionAndClose = () => {
    setSelectedRows([])
    onClose()
  }

  const onSave = async () => {
    const allRequests = selectedRows.map(persona => {
      return addUnitLinkedIdentity({
        params: { venueId, unitId, identityId: persona.id },
        payload: {}
      }).unwrap()
    })
    try {
      await Promise.all(allRequests)
      clearSelectionAndClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const personaListTableQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: groupId,
      filter: { identityId: null }
    },
    pagination: {
      settingsId,
      pageSize: 10
    }
  })

  const columns: TableProps<Persona>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Identity Name' }),
      dataIndex: 'name',
      searchable: true
    },{
      key: 'email',
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      searchable: true
    },{
      key: 'revoked',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'revoked',
      align: 'center',
      render: (_, row) => row.revoked ? $t({ defaultMessage: 'Blocked' })
        : $t({ defaultMessage: 'Active' })
    },{
      key: 'deviceCount',
      title: $t({ defaultMessage: 'Devices' }),
      dataIndex: 'deviceCount'
    }]

  return (
    <Drawer
      destroyOnClose={true}
      width={'700px'}
      visible={visible}
      title={$t({ defaultMessage: 'Add Identity Association' })}
      children={
        <Loader
          states={[
            personaListTableQuery
          ]}
        >
          <Table
            rowKey='name'
            settingsId={settingsId}
            columns={columns}
            enableApiFilter
            dataSource={personaListTableQuery.data?.data}
            pagination={personaListTableQuery.pagination}
            onChange={personaListTableQuery.handleTableChange}
            rowSelection={{
              type: 'checkbox',
              onChange: (_, selRows) => setSelectedRows(selRows)
            }}
          />
        </Loader>
      }
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: $t({ defaultMessage: 'Add' })
        }}
        onSave={onSave}
        onCancel={clearSelectionAndClose}
      />}
      onClose={clearSelectionAndClose}
    />
  )
}
