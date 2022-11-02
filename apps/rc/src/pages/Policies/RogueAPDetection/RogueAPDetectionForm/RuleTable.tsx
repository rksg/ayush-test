import { useContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showActionModal, Table, TableProps }       from '@acx-ui/components'
import { useRoguePolicyQuery }                      from '@acx-ui/rc/services'
import { RogueAPDetectionActionTypes, RogueAPRule } from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RogueAPDetectionDrawer from './RogueAPDetectionDrawer'


type RuleTableProps = {
  edit: boolean
}

const RuleTable = (props: RuleTableProps) => {
  const { $t } = useIntl()
  const { edit } = props

  const { state, dispatch } = useContext(RogueAPDetectionContext)

  const { data } = useRoguePolicyQuery({
    params: useParams()
  })

  const [ruleName, setRuleName] = useState('')
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [visibleEdit, setVisibleEdit] = useState(false)

  const basicColumns = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      dataIndex: 'priority',
      key: 'priority'
    },
    {
      title: $t({ defaultMessage: 'Rule Name' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'RuleType' }),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      dataIndex: 'classification',
      key: 'classification'
    }
  ]

  useEffect(() => {
    if (!state.rules.length && data && edit) {
      dispatch({
        type: RogueAPDetectionActionTypes.UPDATE_ENTIRE_RULE,
        payload: {
          rules: data.rules
        }
      })
    }
  }, [data, state.rules])

  const handleAddAction = () => {
    setVisibleAdd(true)
    setVisibleEdit(false)
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add Rule' }),
    onClick: handleAddAction
  }]

  const editAction = (rows: RogueAPRule[]) => {
    if (rows.length > 1) {
      showActionModal({
        type: 'error',
        content: $t({ defaultMessage: 'Not support multiple operations.' })
      })
    } else {
      setRuleName(rows[0].name)
      setVisibleEdit(true)
      setVisibleAdd(false)
    }
  }

  const moveUpAction = (rows: RogueAPRule[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.MOVE_UP,
      payload: {
        name: rows[0].name,
        priority: rows[0].priority
      }
    })
  }

  const moveDownAction = (rows: RogueAPRule[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.MOVE_DOWN,
      payload: {
        name: rows[0].name,
        priority: rows[0].priority
      }
    })
  }

  const delAction = (rows: RogueAPRule[]) => {
    if (rows.length > 1) {
      showActionModal({
        type: 'error',
        content: $t({ defaultMessage: 'Not support multiple operations.' })
      })
    } else {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: rows[0].name
        },
        onOk: () => {
          rows[0].priority && dispatch({
            type: RogueAPDetectionActionTypes.DEL_RULE,
            payload: {
              name: rows[0].name
            }
          })
          const clearButton = document?.querySelector('button[title="Clear selection"]')
          // @ts-ignore
          clearButton.click()
        }
      })
    }

  }

  const rowActions: TableProps<RogueAPRule>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: editAction
  },{
    label: $t({ defaultMessage: 'Move up' }),
    onClick: moveUpAction
  },{
    label: $t({ defaultMessage: 'Move down' }),
    onClick: moveDownAction
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: delAction
  }] as { label: string, onClick: () => void }[]

  return (
    <>
      <RogueAPDetectionDrawer
        key='rogueAddDrawer'
        visible={visibleAdd}
        setVisible={setVisibleAdd}
        isEditMode={false}
        queryRuleName={''}
      />
      <RogueAPDetectionDrawer
        key='rogueEditDrawer'
        visible={visibleEdit}
        setVisible={setVisibleEdit}
        isEditMode={true}
        queryRuleName={ruleName}
      />
      <Table
        columns={basicColumns}
        dataSource={state.rules}
        rowKey='name'
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
    </>
  )
}

export default RuleTable
