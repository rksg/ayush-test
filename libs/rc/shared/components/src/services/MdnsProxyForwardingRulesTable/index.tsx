import { useState } from 'react'

import { get, isNil, set } from 'lodash'
import { useIntl }         from 'react-intl'
import { v4 as uuidv4 }    from 'uuid'

import { showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping,
  sortProp,
  defaultSort,
  MdnsProxyFeatureTypeEnum,
  NewMdnsProxyForwardingRule
} from '@acx-ui/rc/utils'
import { EdgeScopes, WifiScopes }        from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import { MdnsProxyForwardingRuleDrawer } from '../MdnsProxyForwardingRuleDrawer'

import { RULES_MAX_COUNT } from './constants'

export * from './constants'

interface MdnsProxyForwardingRulesTableProps {
  featureType: MdnsProxyFeatureTypeEnum
  readonly?: boolean;
  tableType?: TableProps<NewMdnsProxyForwardingRule>['type'];
  rules?: NewMdnsProxyForwardingRule[];
  setRules?: (r: NewMdnsProxyForwardingRule[]) => void;
  rowKey?: string
}

export function MdnsProxyForwardingRulesTable (props: MdnsProxyForwardingRulesTableProps) {
  const {
    featureType,
    readonly = false,
    tableType,
    rules,
    setRules = () => null,
    rowKey = 'ruleIndex'
  } = props
  const { $t } = useIntl()
  const featureRbacScope = (featureType === MdnsProxyFeatureTypeEnum.WIFI ? WifiScopes : EdgeScopes)

  const [ drawerFormRule, setDrawerFormRule ] = useState<NewMdnsProxyForwardingRule>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const handleAddAction = () => {
    setDrawerEditMode(false)
    setDrawerVisible(true)
    setDrawerFormRule({} as NewMdnsProxyForwardingRule)
  }

  const handleSetRule = (data: NewMdnsProxyForwardingRule) => {
    const newRules: NewMdnsProxyForwardingRule[] = rules ? rules.slice() : []

    if (drawerEditMode) {
      // eslint-disable-next-line max-len
      const targetIdx = newRules.findIndex((r: NewMdnsProxyForwardingRule) => get(r, rowKey) === get(data, rowKey))
      newRules.splice(targetIdx, 1, data)
    } else {
      set(data, rowKey, uuidv4())
      newRules.push(data)

      if (hasReachedMaxLimit(newRules)) {
        setDrawerVisible(false)
      }
    }

    setRules(newRules)
  }

  const getRuleTypeLabel = (rule: NewMdnsProxyForwardingRule): string => {
    if (rule.service === BridgeServiceEnum.OTHER) {
      // eslint-disable-next-line max-len
      return `_${rule.mdnsName}._${rule.mdnsProtocol?.toLowerCase()}. (${$t(mdnsProxyRuleTypeLabelMapping[rule.service])})`
    }
    return $t(mdnsProxyRuleTypeLabelMapping[rule.service])
  }

  const hasReachedMaxLimit = (rules: NewMdnsProxyForwardingRule[] | undefined) => {
    if (isNil(rules)) return false
    return rules.length >= RULES_MAX_COUNT
  }

  const columns: TableProps<NewMdnsProxyForwardingRule>['columns'] = [
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

  const rowActions: TableProps<NewMdnsProxyForwardingRule>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setDrawerVisible(true)
      setDrawerEditMode(true)
      setDrawerFormRule(selectedRows[0])
    },
    scopeKey: [featureRbacScope.UPDATE]
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows: NewMdnsProxyForwardingRule[], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: getRuleTypeLabel(selectedRows[0])
        },
        onOk: () => {
          const newRules = rules?.filter((r: NewMdnsProxyForwardingRule) => {
            return get(selectedRows[0], rowKey) !== get(r, rowKey)
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
          isRuleUnique={(comingRule: NewMdnsProxyForwardingRule) => {
            const hasDuplicationRule = rules?.some((rule: NewMdnsProxyForwardingRule) => {
              return comingRule.service === rule.service
                && comingRule.fromVlan === rule.fromVlan
                && comingRule.toVlan === rule.toVlan
                && get(comingRule, rowKey) !== get(rule, rowKey)
            })
            return !hasDuplicationRule
          }} />
      }
      <Table
        columns={columns}
        dataSource={rules}
        type={tableType}
        rowKey={rowKey}
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
