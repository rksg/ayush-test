import { useState } from 'react'

import { isNil }        from 'lodash'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping,
  sortProp,
  defaultSort,
  MdnsProxyFeatureTypeEnum
} from '@acx-ui/rc/utils'
import { EdgeScopes, WifiScopes }        from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import { MdnsProxyForwardingRuleDrawer } from '../MdnsProxyForwardingRuleDrawer'

import { RULES_MAX_COUNT } from './constants'

export * from './constants'

interface MdnsProxyForwardingRulesTableProps {
  featureType: MdnsProxyFeatureTypeEnum
  readonly?: boolean;
  tableType?: TableProps<MdnsProxyForwardingRule>['type'];
  rules?: MdnsProxyForwardingRule[];
  setRules?: (r: MdnsProxyForwardingRule[]) => void;
  rowKey?: string
}

export function MdnsProxyForwardingRulesTable (props: MdnsProxyForwardingRulesTableProps) {
  const {
    featureType,
    readonly = false,
    tableType,
    rules,
    setRules = () => null,
    rowKey
  } = props
  const { $t } = useIntl()
  const featureRbacScope = (featureType === MdnsProxyFeatureTypeEnum.WIFI ? WifiScopes : EdgeScopes)

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

      if (hasReachedMaxLimit(newRules)) {
        setDrawerVisible(false)
      }
    }

    setRules(newRules)
  }

  const getRuleTypeLabel = (rule: MdnsProxyForwardingRule): string => {
    if (rule.service === BridgeServiceEnum.OTHER) {
      // eslint-disable-next-line max-len
      return `_${rule.mdnsName}._${rule.mdnsProtocol?.toLowerCase()}. (${$t(mdnsProxyRuleTypeLabelMapping[rule.service])})`
    }
    return $t(mdnsProxyRuleTypeLabelMapping[rule.service])
  }

  const hasReachedMaxLimit = (rules: MdnsProxyForwardingRule[] | undefined) => {
    if (isNil(rules)) return false
    return rules.length >= RULES_MAX_COUNT
  }

  const columns: TableProps<MdnsProxyForwardingRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'service',
      key: 'service',
      sorter: { compare: sortProp('service', defaultSort) },
      render: (_, row) => {
        return getRuleTypeLabel(row)
      }
    },
    {
      title: $t({ defaultMessage: 'From VLAN' }),
      dataIndex: 'fromVlan',
      key: 'fromVlan',
      sorter: { compare: sortProp('fromVlan', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'To VLAN' }),
      dataIndex: 'toVlan',
      key: 'toVlan',
      sorter: { compare: sortProp('toVlan', defaultSort) }
    }
  ]

  const rowActions: TableProps<MdnsProxyForwardingRule>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setDrawerVisible(true)
      setDrawerEditMode(true)
      setDrawerFormRule(selectedRows[0])
    },
    scopeKey: [featureRbacScope.UPDATE]
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows: MdnsProxyForwardingRule[], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: getRuleTypeLabel(selectedRows[0])
        },
        onOk: () => {
          const newRules = rules?.filter((r: MdnsProxyForwardingRule) => {
            return selectedRows[0].id !== r.id
          })

          setRules(newRules ?? [])
          clearSelection()
        }
      })
    },
    scopeKey: [featureRbacScope.DELETE]
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add Rule' }),
    onClick: handleAddAction,
    disabled: hasReachedMaxLimit(rules),
    tooltip: hasReachedMaxLimit(rules)
      // eslint-disable-next-line max-len
      ? $t({ defaultMessage: 'The rule has reached the limit ({maxCount}).' }, { maxCount: RULES_MAX_COUNT })
      : undefined,
    scopeKey: [featureRbacScope.CREATE]
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
            const hasDuplicationRule = rules?.some((rule: MdnsProxyForwardingRule) => {
              return comingRule.service === rule.service
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
        type={tableType}
        rowKey={rowKey || 'ruleIndex'}
        actions={readonly ? [] : filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={readonly ? false :
          // eslint-disable-next-line max-len
          hasPermission({ scopes: [featureRbacScope.UPDATE, featureRbacScope.DELETE] }) && { type: 'radio' }
        }
      />
    </>
  )
}
