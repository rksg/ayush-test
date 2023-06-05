import { useContext, useEffect, useRef, useState } from 'react'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend }                  from 'react-dnd-html5-backend'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { showActionModal, Table, TableProps }                      from '@acx-ui/components'
import { Drag }                                                    from '@acx-ui/icons'
import { useRoguePolicyQuery }                                     from '@acx-ui/rc/services'
import { RogueAPDetectionActionTypes, RogueAPRule, RogueRuleType } from '@acx-ui/rc/utils'
import { filterByAccess }                                          from '@acx-ui/user'

import { rogueRuleLabelMapping, RULE_MAX_COUNT } from '../contentsMap'
import RogueAPDetectionContext                   from '../RogueAPDetectionContext'

import { RogueAPDetectionDrawer } from './RogueAPDetectionDrawer'


type RuleTableProps = {
  edit: boolean
}

type DragItemProps = {
  id: number
}

const RuleTable = (props: RuleTableProps) => {
  const { $t } = useIntl()
  const { edit } = props
  const params = useParams()

  const { state, dispatch } = useContext(RogueAPDetectionContext)

  const { data } = useRoguePolicyQuery({ params: params }, { skip: !edit })

  const [ruleName, setRuleName] = useState('')
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [visibleEdit, setVisibleEdit] = useState(false)

  const basicColumns: TableProps<RogueAPRule>['columns'] = [
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
      title: $t({ defaultMessage: 'Rule Type' }),
      dataIndex: 'type',
      key: 'type',
      render: (data, row: RogueAPRule) => {
        return $t(rogueRuleLabelMapping[row.type as RogueRuleType])
      }
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      dataIndex: 'classification',
      key: 'classification'
    },
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      render: (data, row) => {
        return <div data-testid={`${row.name}_Icon`} style={{ textAlign: 'center' }}>
          <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
        </div>
      }
    }
  ]

  useEffect(() => {
    if (data && edit) {
      dispatch({
        type: RogueAPDetectionActionTypes.UPDATE_ENTIRE_RULE,
        payload: {
          rules: data.rules
        }
      })
    }
  }, [data])

  const handleAddAction = () => {
    if (state.rules.length === RULE_MAX_COUNT) {
      showActionModal({
        type: 'error',
        content: $t({
          defaultMessage: 'The max-number of rules in a rogue ap policy profile is 32.'
        })
      })
    } else {
      setVisibleAdd(true)
      setVisibleEdit(false)
    }
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add Rule' }),
    onClick: handleAddAction
  }]

  // @ts-ignore
  const DraggableRow = (props) => {
    const ref = useRef(null)
    const { className, onClick, ...restProps } = props

    const [, drag] = useDrag(() => ({
      type: 'DraggableRow',
      item: {
        id: props['data-row-key']
      },
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }))

    const [{ isOver }, drop] = useDrop({
      accept: 'DraggableRow',
      drop: (item: DragItemProps) => {
        // @ts-ignore
        const hoverIdx = Number(ref.current.getAttribute('data-row-key'))
        const idx = item.id ?? -1
        if (idx && idx !== hoverIdx) {
          dispatch({
            type: RogueAPDetectionActionTypes.DRAG_AND_DROP,
            payload: {
              oldIndex: idx - 1, newIndex: hoverIdx - 1
            }
          })
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    })

    drag(drop(ref))

    return (
      <tr
        ref={ref}
        className={className}
        onClick={onClick}
        {...restProps}
        style={isOver ? {
          backgroundColor: 'var(--acx-accents-blue-10)',
          borderColor: 'var(--acx-accents-blue-10)'
        } : {}}
      >
        {props.children}
      </tr>
    )
  }

  const editAction = (rows: RogueAPRule[], clearSelection: () => void) => {
    setRuleName(rows[0].name)
    setVisibleEdit(true)
    setVisibleAdd(false)
    clearSelection()
  }

  const delAction = (rows: RogueAPRule[], clearSelection: () => void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Rule' }),
        numOfEntities: rows.length,
        entityValue: rows[0].name
      },
      onOk: () => {
        dispatch({
          type: RogueAPDetectionActionTypes.DEL_RULE,
          payload: {
            name: rows.map(row => row.name)
          }
        })
      }
    })
    clearSelection()
  }

  const rowActions: TableProps<RogueAPRule>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (row: RogueAPRule[]) => row.length <= 1,
    onClick: editAction
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: delAction
  }] as { label: string, visible: () => boolean, onClick: () => void }[]

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
        setRuleName={setRuleName}
        isEditMode={true}
        queryRuleName={ruleName}
      />
      <DndProvider backend={HTML5Backend} >
        <Table
          columns={basicColumns}
          dataSource={[...state.rules].sort((a, b) => a.priority! - b.priority!)}
          rowKey='priority'
          actions={filterByAccess(actions)}
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'checkbox' }}
          components={{
            body: {
              row: DraggableRow
            }
          }}
        />
      </DndProvider>
    </>
  )
}

export default RuleTable
