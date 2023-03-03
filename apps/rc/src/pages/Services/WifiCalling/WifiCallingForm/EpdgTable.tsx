import { useContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showActionModal, Table, TableProps }                     from '@acx-ui/components'
import { hasAccesses }                                            from '@acx-ui/rbac'
import { useGetWifiCallingServiceQuery }                          from '@acx-ui/rc/services'
import { EPDG, WifiCallingActionPayload, WifiCallingActionTypes } from '@acx-ui/rc/utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

import WifiCallingDrawer from './WifiCallingDrawer'


const EpdgTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [visibleEdit, setVisibleEdit] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [serviceIndex, setServiceIndex] = useState<number | undefined>(undefined)
  const RULE_NUMBER_LIMIT = 5

  const { state, dispatch } = useContext(WifiCallingFormContext)

  const { data } = useGetWifiCallingServiceQuery({ params: useParams() })

  const [tableData, setTableData] = useState(state.ePDG as EPDG[])

  const basicColumns = [
    {
      title: $t({ defaultMessage: 'Domain' }),
      dataIndex: 'domain',
      key: 'domain'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      key: 'ip'
    }
  ]

  useEffect(() => {
    if (!state.serviceName && !state.ePDG.length && data && edit) {
      dispatch({
        type: WifiCallingActionTypes.UPDATE_ENTIRE_EPDG,
        payload: data.epdgs
      } as WifiCallingActionPayload)
      setTableData(data.epdgs?.map((epdg) => ({
        domain: epdg.domain,
        ip: epdg.ip
      })) ?? [])
    } else {
      setTableData(state.ePDG)
    }
  }, [data, state])

  const handleAddAction = () => {
    setVisibleAdd(true)
    setVisibleEdit(false)
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    disabled: state.ePDG.length === RULE_NUMBER_LIMIT,
    onClick: handleAddAction
  }]

  const rowActions: TableProps<EPDG>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([{ domain }]: EPDG[]) => {
      setVisibleEdit(true)
      setVisibleAdd(false)

      const editIndex = !state.ePDG.length && edit
        ? data?.epdgs?.findIndex(value => value.domain === domain)
        : state.ePDG.findIndex(value => value.domain === domain)
      setServiceName(domain)
      setServiceIndex(editIndex)
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ domain }]: EPDG[], clearSelection: () => void) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: domain
        },
        onOk: () => {
          dispatch({
            type: WifiCallingActionTypes.DELETE_EPDG,
            payload: {
              id: state.ePDG.findIndex(value => value.domain === domain)
            }
          })
          clearSelection()
        }
      })
    }
  }] as { label: string, onClick: () => void }[]

  return (
    <>
      <WifiCallingDrawer
        visible={visibleAdd}
        setVisible={setVisibleAdd}
        isEditMode={false}
        serviceName={serviceName}
        serviceIndex={undefined}
      />
      <WifiCallingDrawer
        visible={visibleEdit}
        setVisible={setVisibleEdit}
        isEditMode={true}
        serviceIndex={serviceIndex}
      />

      <Table
        columns={basicColumns}
        dataSource={tableData}
        rowKey='domain'
        actions={hasAccesses(actions)}
        rowActions={hasAccesses(rowActions)}
        rowSelection={{ type: 'radio' }}
      />
    </>
  )
}

export default EpdgTable
