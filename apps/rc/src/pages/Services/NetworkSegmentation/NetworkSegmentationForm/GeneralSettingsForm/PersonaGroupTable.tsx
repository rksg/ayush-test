import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                               from '@acx-ui/components'
import { useGetDpskQuery, useGetPersonaGroupByIdQuery }                            from '@acx-ui/rc/services'
import { DpskDetailsTabKey, getServiceDetailsLink, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink }                                                              from '@acx-ui/react-router-dom'

import { PersonaGroupLink } from '../../../../Users/Persona/LinkHelper'

interface PersonaGroupTableProps {
  personaGroupId?: string
}

interface TableDataType {
  personaGroupName?: string
  personaGroupId?: string
  personaCount?: number
  dpskName?: string
  dpskId?: string
  dpskNetworkCount?: number
}

export const PersonaGroupTable = (props: PersonaGroupTableProps) => {

  const { $t } = useIntl()
  const [tableData, setTableData] = useState<TableDataType[]>([])

  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: props.personaGroupId } },
    { skip: !!!props.personaGroupId }
  )
  const {
    data: dpskData,
    isLoading: isDpskLoading
  } = useGetDpskQuery(
    { params: { serviceId: personaGroupData?.dpskPoolId } },
    { skip: !!!personaGroupData?.dpskPoolId }
  )

  useEffect(() => {
    if (personaGroupData) {
      setTableData([
        {
          personaGroupName: personaGroupData?.name,
          personaGroupId: personaGroupData?.id,
          personaCount: personaGroupData?.personas?.length || 0,
          dpskName: dpskData?.name,
          dpskId: dpskData?.id,
          dpskNetworkCount: dpskData?.networkIds?.length
        }
      ])
    }
  }, [personaGroupData, dpskData])

  const columns: TableProps<TableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Persona Group' }),
      key: 'personaGroupName',
      dataIndex: 'personaGroupName',
      render: (data, row) => (<PersonaGroupLink
        name={row.personaGroupName}
        personaGroupId={row.personaGroupId}
      />)
    },
    {
      title: $t({ defaultMessage: 'Number of Personas' }),
      key: 'personaCount',
      dataIndex: 'personaCount'
    },
    {
      title: $t({ defaultMessage: 'DPSK Service' }),
      key: 'dpskName',
      dataIndex: 'dpskName',
      render: (data, row) => {
        return (
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.DPSK,
            oper: ServiceOperation.DETAIL,
            serviceId: row.dpskId! || '',
            activeTab: DpskDetailsTabKey.OVERVIEW
          })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'DPSK Networks' }),
      key: 'dpskNetworkCount',
      dataIndex: 'dpskNetworkCount'
    }
  ]

  return (
    <Loader states={[
      {
        isLoading: false,
        isFetching: isPersonaGroupLoading || isDpskLoading
      }
    ]}>
      <Table
        type='form'
        rowKey='personaGroupId'
        columns={columns}
        dataSource={tableData}
      />
    </Loader>
  )
}
