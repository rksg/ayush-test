import { useContext, useEffect, useState } from 'react'

import { useIntl }                                                                                          from 'react-intl'
import { useParams }                                                                                        from 'react-router-dom'
import { SortableContainer, SortableElement, SortableHandle, SortableElementProps, SortableContainerProps } from 'react-sortable-hoc'

import { showActionModal, Table, TableProps }                      from '@acx-ui/components'
import { Drag }                                                    from '@acx-ui/icons'
import { useRoguePolicyQuery }                                     from '@acx-ui/rc/services'
import { RogueAPDetectionActionTypes, RogueAPRule, RogueRuleType } from '@acx-ui/rc/utils'
import { hasAccesses }                                             from '@acx-ui/user'

import { rogueRuleLabelMapping } from '../../contentsMap'
import RogueAPDetectionContext   from '../RogueAPDetectionContext'

import RogueAPDetectionDrawer from './RogueAPDetectionDrawer'


type RuleTableProps = {
  edit: boolean
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

  const DragHandle = SortableHandle(() =>
    <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
  )

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
          <DragHandle/>
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
    if (state.rules.length === 32) {
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
  const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
  // @ts-ignore
  const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

  const DraggableContainer = (props: SortableContainerProps) => {
    return <SortContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        dispatch({
          type: RogueAPDetectionActionTypes.DRAG_AND_DROP,
          payload: {
            oldIndex, newIndex
          }
        })
      }}
      {...props}
    />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props
    const index = state.rules.findIndex((x) => x.name === restProps['data-row-key'])
    return <SortableItem index={index} {...restProps} />
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
      <Table
        columns={basicColumns}
        dataSource={state.rules}
        rowKey='name'
        actions={hasAccesses(actions)}
        rowActions={hasAccesses(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow
          }
        }}
        columnState={{ hidden: true }}
      />
    </>
  )
}

export default RuleTable
