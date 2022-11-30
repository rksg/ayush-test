import { useContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showActionModal, Table, TableProps }       from '@acx-ui/components'
import { useRoguePolicyQuery }                      from '@acx-ui/rc/services'
import { RogueAPDetectionActionTypes, RogueAPRule } from '@acx-ui/rc/utils'
import { RogueRuleTypeEnum }                        from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

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

  const renderRuleType = (ruleType: string) => {
    const ruleTypes = {
      SameNetworkRule: $t({ defaultMessage: 'Same Network Rule' }),
      MacSpoofingRule: $t({ defaultMessage: 'Mac Spoofing Rule' }),
      SsidSpoofingRule: $t({ defaultMessage: 'SSID Spoofing Rule' }),
      RTSAbuseRule: $t({ defaultMessage: 'RTS Abuse Rule' }),
      CTSAbuseRule: $t({ defaultMessage: 'CTS Abuse Rule' }),
      DeauthFloodRule: $t({ defaultMessage: 'Deauth Flood Rule' }),
      DisassocFloodRule: $t({ defaultMessage: 'Disassoc Flood Rule' }),
      ExcessivePowerRule: $t({ defaultMessage: 'Excessive Power Rule' }),
      NullSSIDRule: $t({ defaultMessage: 'Null SSID Rule' }),
      AdhocRule: $t({ defaultMessage: 'Adhoc' })
    } as { [key in RogueRuleTypeEnum]: string }

    return ruleTypes[ruleType as RogueRuleTypeEnum]
  }

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
        return renderRuleType(row.type)
      }
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

  const editAction = (rows: RogueAPRule[], clearSelection: () => void) => {
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
    clearSelection()
  }

  const moveUpAction = (rows: RogueAPRule[], clearSelection: () => void) => {
    dispatch({
      type: RogueAPDetectionActionTypes.MOVE_UP,
      payload: {
        name: rows[0].name,
        priority: rows[0].priority
      }
    })
    clearSelection()
  }

  const moveDownAction = (rows: RogueAPRule[], clearSelection: () => void) => {
    dispatch({
      type: RogueAPDetectionActionTypes.MOVE_DOWN,
      payload: {
        name: rows[0].name,
        priority: rows[0].priority
      }
    })
    clearSelection()
  }

  const delAction = (rows: RogueAPRule[], clearSelection: () => void) => {
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
        }
      })
    }
    clearSelection()
  }

  const rowActions: TableProps<RogueAPRule>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (row: RogueAPRule[]) => row.length <= 1,
    onClick: editAction
  },{
    label: $t({ defaultMessage: 'Move up' }),
    visible: (row: RogueAPRule[]) => row.length <= 1,
    onClick: moveUpAction
  },{
    label: $t({ defaultMessage: 'Move down' }),
    visible: (row: RogueAPRule[]) => row.length <= 1,
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
