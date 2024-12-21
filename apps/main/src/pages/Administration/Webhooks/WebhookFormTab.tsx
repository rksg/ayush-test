import { Key, useState } from 'react'

import { Form, TreeDataNode } from 'antd'
import Tree                   from 'antd/lib/tree'

import * as UI from './styledComponents'
interface WebhookTabProps {
    treeData: TreeDataNode[]
    checked: Key[]
    updateChecked: (checked: Key[]) => void
    multiColumn?: boolean
}

const WebhookFormTab = (props: WebhookTabProps) => {
  const { treeData, checked, updateChecked, multiColumn = false } = props
  const [checkedKeys, setCheckedKeys] = useState<Key[]>(checked)

  const onCheck = (checkedKeys: Key[]) => {
    setCheckedKeys(checkedKeys)
    const checkedChildren = checkedKeys.filter(key => !treeData.map(t => t.key).includes(key))
    updateChecked(checkedChildren)
  }

  return <Form.Item valuePropName='checked'>
    <UI.WebhookCheckboxWrapper>
      <Tree
        className={multiColumn ? 'multi-col' : ''}
        checkable={true}
        treeData={treeData}
        expandedKeys={treeData.map(t => t.key)}
        switcherIcon={<div hidden></div>}
        checkedKeys={checkedKeys}
        onCheck={(checkedKeys) => onCheck(checkedKeys as Key[])}
      />
    </UI.WebhookCheckboxWrapper>
  </Form.Item>
}

export default WebhookFormTab
