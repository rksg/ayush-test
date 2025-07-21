import React, { useState } from 'react'

import { Transfer, Tree, Checkbox, Radio } from 'antd'

import type { TransferItem } from 'antd/lib/transfer'

type TreeTransferProps = {
  dataSource: TransferItem[];
  targetKeys: string[];
  selectedKeys: string[];
  onTargetKeysChange: (keys: string[]) => void;
  onSelectedKeysChange: (keys: string[]) => void;
  enableMultiselect?: boolean;
  enableGroupSelect?: boolean;
}

export const GroupedTreeTransfer: React.FC<TreeTransferProps> = ({
  dataSource,
  targetKeys,
  selectedKeys,
  onTargetKeysChange,
  onSelectedKeysChange,
  enableMultiselect = true,
  enableGroupSelect = false
}) => {
  const disableGroupSelect = enableGroupSelect || !enableMultiselect
  const flattedData = flattenTreeToTransferItems(dataSource)
  const getGroupSelectedMap = () => {
    const map = new Map<string, string>()
    targetKeys.forEach((key) => {
      const [group] = key.split('-item-')
      map.set(group, key)
    })
    return map
  }

  const groupSelectedMap = enableMultiselect ? new Map() : getGroupSelectedMap()

  const handleItemSelect = (key: string) => {
    const alreadyInTarget = targetKeys.includes(key)
    if (alreadyInTarget) return

    if (enableMultiselect) {
      onSelectedKeysChange(
        selectedKeys.includes(key)
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys, key]
      )
    } else {
      onSelectedKeysChange([key])
    }
  }

  const getChildrenKeys = (groupKey: string) => {
    const group = dataSource.find(g => g.key === groupKey)
    return group?.children?.map(child => child.key) || []
  }

  const handleGroupCheck = (groupKey: string) => {
    const childrenKeys = getChildrenKeys(groupKey)
    const isAllSelected = childrenKeys.every((key) => selectedKeys.includes(key))
    onSelectedKeysChange(
      isAllSelected
        ? selectedKeys.filter((key) => !childrenKeys.includes(key))
        : Array.from(new Set([...selectedKeys, ...childrenKeys]))
    )
  }

  const generateTree = (treeNodes: TransferItem[]) =>
    treeNodes.map((node) => {
      const { children, key } = node
      const isGroupLevel = node.isGroupLevel

      if (isGroupLevel) {
        const childrenKeys = children.map((child: TransferItem) => child.key)
        const transferredChildren = childrenKeys.filter((key: string) => targetKeys.includes(key))
        const leftChildren = childrenKeys.filter((key: string) => !targetKeys.includes(key))
        const selectedChildren = leftChildren.filter((key: string) => selectedKeys.includes(key))
        const allTransferred = transferredChildren.length === childrenKeys.length
        const allSelected = allTransferred
        || (selectedChildren.length === leftChildren.length && leftChildren.length > 0)
        const someSelected = !allTransferred
        && selectedChildren.length > 0 && selectedChildren.length < leftChildren.length

        return {
          ...node,
          title: (
            <div
              onClick={(e) => {
                e.stopPropagation()
                if (!disableGroupSelect && !allTransferred) {
                  handleGroupCheck(key)
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: disableGroupSelect || allTransferred ? 'not-allowed' : 'pointer',
                userSelect: 'none'
              }}
            >
              {!disableGroupSelect && (
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={allTransferred}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginRight: 8 }}
                />
              )}
              {node.title}
            </div>
          ),
          children: generateTree(children)
        }
      }

      const [groupKey] = key?.split('-item-') || []
      const alreadySelected = targetKeys.includes(key)
      let disabled = alreadySelected

      if (!enableMultiselect) {
        const selectedInGroup = groupSelectedMap.get(groupKey)
        if (selectedInGroup && selectedInGroup !== key) {
          disabled = true
        }
      }

      const isSelected = targetKeys.includes(key) || selectedKeys.includes(key)

      return {
        ...node,
        checkable: false,
        disabled,
        title: (
          <div
            onClick={() => !disabled && handleItemSelect(key)}
            style={{ display: 'flex', alignItems: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {enableMultiselect ? (
              <Checkbox checked={isSelected} disabled={disabled} style={{ marginRight: 8 }} />
            ) : (
              <Radio checked={isSelected} disabled={disabled} style={{ marginRight: 8 }} />
            )}
            {node.title}
          </div>
        )
      }
    })

  const handleTransferChange = (nextTargetKeys: string[]) => {
    const removedKeys = targetKeys.filter(key => !nextTargetKeys.includes(key))
    onTargetKeysChange(nextTargetKeys)
    onSelectedKeysChange(selectedKeys.filter(key => !removedKeys.includes(key)))
  }

  return (
    <Transfer
      dataSource={flattedData}
      targetKeys={targetKeys}
      onChange={handleTransferChange}
      selectedKeys={selectedKeys}
      onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
        onSelectedKeysChange([...sourceSelectedKeys, ...targetSelectedKeys])
      }}
      render={(item) => item.title}
      showSelectAll={false}
    >
      {({ direction }) =>
        direction === 'left' ? (
          <Tree
            defaultExpandAll
            checkable={false}
            checkedKeys={selectedKeys}
            treeData={generateTree(dataSource)}
          />
        ) : null
      }
    </Transfer>
  )
}

const flattenTreeToTransferItems = (treeData: TransferItem[]): TransferItem[] => {
  const result: TransferItem[] = []

  const traverse = (nodes: TransferItem[]) => {
    for (const node of nodes) {
      if (node.children) {
        traverse(node.children)
      } else {
        result.push({ key: node.key, title: node.title })
      }
    }
  }

  traverse(treeData)
  return result
}

export const TreeTransfer: React.FC<GroupedTreeTransferProps> = () => {
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const data = [
    {
      key: 'group-1',
      title: 'Group 1',
      isGroupLevel: true,
      children: [
        { key: 'group-1-item-1', title: 'Item 1' },
        { key: 'group-1-item-2', title: 'Item 2' },
        { key: 'group-1-item-3', title: 'Item 3' },
        { key: 'group-1-item-4', title: 'Item 4' },
        { key: 'group-1-item-5', title: 'Item 5' }
      ]
    },
    {
      key: 'group-2',
      title: 'Group 2',
      isGroupLevel: true,
      children: [
        { key: 'group-2-item-1', title: 'Item 1' },
        { key: 'group-2-item-2', title: 'Item 2' },
        { key: 'group-2-item-3', title: 'Item 3' },
        { key: 'group-2-item-4', title: 'Item 4' }
      ]
    }
  ]

  return <>
    <GroupedTreeTransfer
      dataSource={data}
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onTargetKeysChange={setTargetKeys}
      onSelectedKeysChange={setSelectedKeys}
    />
    <GroupedTreeTransfer
      dataSource={data}
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onTargetKeysChange={setTargetKeys}
      onSelectedKeysChange={setSelectedKeys}
      enableGroupSelect={false}
    />
    <GroupedTreeTransfer
      dataSource={data}
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onTargetKeysChange={setTargetKeys}
      onSelectedKeysChange={setSelectedKeys}
      enableMultiselect={false}
      enableGroupSelect={false}
    />
  </>
}
