import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, showActionModal, Table, TableProps } from '@acx-ui/components'
import { MdnsProxyForwardingRule }                    from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRuleDrawer } from './MdnsProxyForwardingRuleDrawer'


export function MdnsProxyForwardingRulesTable () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const rules: MdnsProxyForwardingRule[] = form.getFieldValue('forwardingRules')
  const [ drawerFormRule, setDrawerFormRule ] = useState<MdnsProxyForwardingRule>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ selectedRuleIndex, setSelectedItemIndex ] = useState(-1)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const handleAddAction = () => {
    setDrawerEditMode(false)
    setDrawerVisible(true)
    setDrawerFormRule({} as MdnsProxyForwardingRule)
  }

  const handleSetRule = (data: MdnsProxyForwardingRule) => {
    const newRules = rules ? rules.slice() : []

    if (drawerEditMode) {
      newRules[selectedRuleIndex] = data
    } else {
      newRules.push(data)
    }
    form.setFieldValue('forwardingRules', newRules)
  }

  const columns: TableProps<MdnsProxyForwardingRule>['columns'] = [
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'From VLAN' }),
      dataIndex: 'fromVlan',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'To VLAN' }),
      dataIndex: 'toVlan',
      sorter: true
    }
  ]

  const actions: TableProps<MdnsProxyForwardingRule>['actions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setDrawerVisible(true)
      setDrawerEditMode(true)

      const selectedRuleIndex = rules.findIndex(value => value.type === selectedRows[0].type)
      setSelectedItemIndex(selectedRuleIndex)
      setDrawerFormRule(rules[selectedRuleIndex])
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows: MdnsProxyForwardingRule[], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Rule' }),
          entityValue: selectedRows[0].type
        },
        onOk: () => {
          const newRules = rules.filter((r: MdnsProxyForwardingRule) => {
            return selectedRows.every((s: MdnsProxyForwardingRule) => s.type !== r.type )
          })

          form.setFieldValue('forwardingRules', newRules)
          clearSelection()
        }
      })
    }
  }]

  return (
    <>
      <Button
        id='addRuleButton'
        type='link'
        onClick={handleAddAction}>
        {$t({ defaultMessage: 'Add Rule' })}
      </Button>
      <MdnsProxyForwardingRuleDrawer
        editMode={drawerEditMode}
        rule={(drawerFormRule)}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        setRule={handleSetRule}
      />
      <Table
        columns={columns}
        dataSource={rules}
        rowKey='type'
        actions={actions}
        rowSelection={{ type: 'radio' }}
      />
    </>
  )
}
