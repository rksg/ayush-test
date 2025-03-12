import { Key, useEffect, useState } from 'react'

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
  const [checkedKeys, setCheckedKeys] = useState<Key[]>()

  const onCheck = (checkedKeys: Key[]) => {
    setCheckedKeys(checkedKeys)
    const checkedChildren = checkedKeys.filter(key => !treeData.map(t => t.key).includes(key))
    updateChecked(checkedChildren)
  }

  const keysInTree = (keys: Key[] | undefined, tree: TreeDataNode[]) => {
    return keys && keys.every(key => tree.find(t => t.key === key)
    || tree.flatMap(t => t.children).find(tc => tc?.key === key))
  }

  useEffect(() => {
    setCheckedKeys(checked)
  }, [checked])

  const parents = treeData.map(t => t.key)

  return <Form.Item valuePropName='checked'>
    <UI.WebhookCheckboxWrapper>
      {keysInTree(checkedKeys, treeData) && <Tree
        className={multiColumn ? 'multi-col' : ''}
        checkable={true}
        treeData={treeData}
        expandedKeys={parents}
        switcherIcon={<div hidden></div>}
        checkedKeys={checkedKeys}
        onCheck={(checkedKeys) => onCheck(checkedKeys as Key[])}
        rootClassName=''
      />}
    </UI.WebhookCheckboxWrapper>
  </Form.Item>
}

export default WebhookFormTab
