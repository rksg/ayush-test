import { useState } from 'react'

import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { showActionModal, Table, TableProps }                       from '@acx-ui/components'
import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

import { MdnsProxyForwardingRuleDrawer } from './MdnsProxyForwardingRuleDrawer'

interface MdnsProxyForwardingRulesTableProps {
  readonly?: boolean;
  rules?: MdnsProxyForwardingRule[];
  setRules?: (r: MdnsProxyForwardingRule[]) => void;
}

export function MdnsProxyForwardingRulesTable (props: MdnsProxyForwardingRulesTableProps) {
  const { readonly = false, rules = [], setRules = () => null } = props
  const { $t } = useIntl()
  const [ drawerFormRule, setDrawerFormRule ] = useState<MdnsProxyForwardingRule>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const handleAddAction = () => {
    setDrawerEditMode(false)
    setDrawerVisible(true)
    setDrawerFormRule({} as MdnsProxyForwardingRule)
  }

  const handleSetRule = (data: MdnsProxyForwardingRule) => {
    const newRules: MdnsProxyForwardingRule[] = rules ? rules.slice() : []

    if (drawerEditMode) {
      const targetIdx = newRules.findIndex((r: MdnsProxyForwardingRule) => r.id === data.id)
      newRules.splice(targetIdx, 1, data)
    } else {
      data.id = uuidv4()
      newRules.push(data)
    }

    setRules(newRules)
  }

  const columns: TableProps<MdnsProxyForwardingRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (data) => {
        return $t(ruleTypeLabelMapping[data as MdnsProxyForwardingRuleTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: 'From VLAN' }),
      dataIndex: 'fromVlan',
      key: 'fromVlan',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'To VLAN' }),
      dataIndex: 'toVlan',
      key: 'toVlan',
      sorter: true
    }
  ]

  const rowActions: TableProps<MdnsProxyForwardingRule>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setDrawerVisible(true)
      setDrawerEditMode(true)
      setDrawerFormRule(selectedRows[0])
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows: MdnsProxyForwardingRule[], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: $t(ruleTypeLabelMapping[selectedRows[0].type])
        },
        onOk: () => {
          const newRules = rules.filter((r: MdnsProxyForwardingRule) => {
            return selectedRows[0].id !== r.id
          })

          setRules(newRules)
          clearSelection()
        }
      })
    }
  }]

  return (
    <>
      {!readonly &&
        <MdnsProxyForwardingRuleDrawer
          editMode={drawerEditMode}
          rule={(drawerFormRule)}
          visible={drawerVisible}
          setVisible={setDrawerVisible}
          setRule={handleSetRule}
          isRuleUnique={(comingRule: MdnsProxyForwardingRule) => {
            // eslint-disable-next-line max-len
            const hasDuplicationRule = rules.some((rule: MdnsProxyForwardingRule) => {
              return comingRule.type === rule.type
                && comingRule.fromVlan === rule.fromVlan
                && comingRule.toVlan === rule.toVlan
                && comingRule.id !== rule.id
            })

            return !hasDuplicationRule
          }} />
      }
      <Table
        columns={columns}
        dataSource={rules}
        rowKey='id'
        actions={readonly
          ? []
          : [{
            label: $t({ defaultMessage: 'Add Rule' }),
            onClick: handleAddAction
          }]}
        rowActions={rowActions}
        rowSelection={readonly ? false : { type: 'radio' }}
      />
    </>
  )
}
