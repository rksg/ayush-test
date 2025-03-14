import { useState } from 'react'

import {  useIntl } from 'react-intl'

import { Drawer, Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useSearchPersonaListQuery,
  useAddUnitLinkedIdentityMutation,
  useGetUnitsLinkedIdentitiesQuery,
  useGetPropertyUnitListQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  Persona,
  SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'

export interface PropertyUnitIdentityDrawerProps {
  visible: boolean,
  onClose: () => void,
  groupId?: string,
  venueId?: string,
  unitId?: string,
  identityCount?: number | 0
}

export function PropertyUnitIdentityDrawer (props: PropertyUnitIdentityDrawerProps) {
  const { $t } = useIntl()
  const MAX_IDENTITY_COUNT = 10
  const { visible, onClose, groupId, venueId, unitId, identityCount } = props
  const settingsId = 'property-units-identity-table'
  const identities = new Map(useGetUnitsLinkedIdentitiesQuery({ params: { venueId },
    payload: { pageSize: 10000, page: 1, sortOrder: 'ASC' }
  }).data?.data.map(identity => [identity.personaId,identity.unitId]))
  const units = new Map(useGetPropertyUnitListQuery({
    params: { venueId },
    payload: {
      page: 1,
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }).data?.data.map(unit => [unit.id,unit.name]))

  const [selectedRows, setSelectedRows] = useState<Persona[]>([])
  const [addUnitLinkedIdentity] = useAddUnitLinkedIdentityMutation()

  const clearSelectionAndClose = () => {
    setSelectedRows([])
    onClose()
  }

  const onSave = async () => {
    const identityLimit = (identityCount || 0) + selectedRows.length
    if(identityLimit > MAX_IDENTITY_COUNT)
    {
      (showActionModal({
        type: 'error',
        content: $t({
          defaultMessage:
            'Selection exceeding the maximum identity limit for unit'
        })
      }))
    } else {
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
      searchable: true,
      disable: true
    },{
      key: 'email',
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      searchable: true
    },{
      key: 'phoneNumber',
      title: $t({ defaultMessage: 'Phone' }),
      dataIndex: 'phoneNumber'
    },{
      key: 'revoked',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'revoked',
      align: 'center',
      render: (_, row) => row.revoked ? $t({ defaultMessage: 'Blocked' })
        : $t({ defaultMessage: 'Active' })
    },{
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      searchable: true,
      width: 200
    },{
      key: 'unit',
      title: $t({ defaultMessage: 'unit' }),
      dataIndex: 'unit'
    }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...personaListTableQuery.payload,
      keyword: customSearch?.searchString ?? ''
    }
    personaListTableQuery.setPayload(payload)
  }

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
            dataSource={personaListTableQuery.data?.data.map(identity => {
              return { ...identity, unit: units.get(identities.get(identity.id) as string) }
            })}
            pagination={personaListTableQuery.pagination}
            onChange={personaListTableQuery.handleTableChange}
            onFilterChange={handleFilterChange}
            rowSelection={{
              type: 'checkbox',
              getCheckboxProps: (record: Persona) => ({
                disabled: record.unit !== null && record.unit !== '' && record.unit !== undefined
              }),
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
