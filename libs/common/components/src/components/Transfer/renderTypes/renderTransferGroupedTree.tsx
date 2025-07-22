import { Checkbox, Radio }  from 'antd'
import { DataNode }         from 'antd/es/tree'
import { TransferItem }     from 'antd/lib/transfer'
import { AntTreeNodeProps } from 'antd/lib/tree'
import _                    from 'lodash'

import { MinusSquareOutlined, PlusSquareOutlined } from '@acx-ui/icons-new'

import { TransferProps } from '../index'
import * as UI           from '../styledComponents'

import type { TransferListBodyProps } from 'antd/es/transfer/ListBody'

export type TreeTransferItem = TransferItem & {
  key: string
  groupKey?: string
}

export function flattenTree (treeData: TreeTransferItem[]): TreeTransferItem[] {
  const result: TreeTransferItem[] = []
  const traverse = (nodes: TreeTransferItem[], parentGroupKey?: string) => {
    nodes.forEach((node) => {
      if (node.children) {
        traverse(node.children, node.key)
      } else {
        result.push({ ...node, groupKey: parentGroupKey })
      }
    })
  }
  traverse(treeData)
  return result
}

export function renderTransferGroupedTree (
  props: TransferProps,
  transferProps: TransferListBodyProps<TreeTransferItem>
) {
  if (transferProps.direction === 'right') return null

  const {
    dataSource = [],
    targetKeys = [],
    selectedKeys = [],
    onSelectChange: onSelectedKeysChange,
    enableGroupSelect = false,
    enableMultiselect = true
  } = props

  const flattenedData = flattenTree(dataSource as TreeTransferItem[])
  const isGroupSelectable = enableGroupSelect && enableMultiselect

  const handleItemSelect = (key: string) => {
    const alreadyInTarget = targetKeys.includes(key)
    if (alreadyInTarget) return

    if (enableMultiselect) {
      const newSelectedKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key]
      onSelectedKeysChange?.(newSelectedKeys, [])
    } else {
      onSelectedKeysChange?.([key], [])
    }
  }

  const handleGroupCheck = (groupKey: string) => {
    const availableChildrenKeys = flattenedData
      .filter(item => item.groupKey === groupKey && !targetKeys.includes(item.key))
      .map(item => item.key)

    const isAllSelected = availableChildrenKeys.every((key: string) => selectedKeys.includes(key))
    const newSelectedKeys = isAllSelected
      ? selectedKeys.filter((key) => !availableChildrenKeys.includes(key))
      : Array.from(new Set([...selectedKeys, ...availableChildrenKeys]))

    onSelectedKeysChange?.(newSelectedKeys, [])
  }

  const renderGroupNode = (node: TreeTransferItem) => {
    const { children, key } = node
    const childrenKeys = children.map((child: TreeTransferItem) => child.key)
    const transferredKeys = childrenKeys.filter((key: string) => targetKeys.includes(key))
    const availableChildrenKeys = _.difference(childrenKeys, transferredKeys)
    const selectedChildren = _.intersection(availableChildrenKeys, selectedKeys)

    const allTransferred = transferredKeys.length === childrenKeys.length
    const allSelected = allTransferred
      // eslint-disable-next-line max-len
      || (selectedChildren.length === availableChildrenKeys.length && availableChildrenKeys.length > 0)
    const someSelected = !allTransferred
      && selectedChildren.length > 0 && selectedChildren.length < availableChildrenKeys.length

    return {
      ...node,
      title: (
        <UI.TreeItem
          selectable={isGroupSelectable}
          disabled={isGroupSelectable && allTransferred}
          style={{ userSelect: 'none' }}
          onClick={(e) => {
            e.stopPropagation()
            if (isGroupSelectable && !allTransferred) {
              handleGroupCheck(key)
            }
          }}
        >
          {isGroupSelectable && (
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              disabled={allTransferred}
              style={{ pointerEvents: 'none' }}
            />
          )}
          { node.name }
        </UI.TreeItem>
      ),
      children: generateTree(children)
    }
  }

  const renderLeafNode = (node: TreeTransferItem) => {
    const { key } = node
    const isItemSelected = selectedKeys.includes(key) || targetKeys.includes(key)
    let shouldDisabled = targetKeys.includes(key)

    if (!enableMultiselect) {
      const item = flattenedData.find((item: TreeTransferItem) => item.key === key)
      const targetGroupKeys = flattenedData
        .filter((item: TreeTransferItem) => targetKeys.includes(item?.key || ''))
        .map((item: TreeTransferItem) => item.groupKey)

      shouldDisabled = targetGroupKeys.includes(item?.groupKey)
    }

    return {
      ...node,
      checkable: false,
      disabled: shouldDisabled,
      title: (
        <UI.TreeItem
          disabled={shouldDisabled}
          onClick={() => !shouldDisabled && handleItemSelect(key)}
        >
          { enableMultiselect
            ? <Checkbox checked={isItemSelected} disabled={shouldDisabled} />
            : <Radio checked={isItemSelected} disabled={shouldDisabled} />
          }
          {typeof node.name === 'string' ? node.name : node.title}
        </UI.TreeItem>
      )
    }
  }

  const generateTree = (nodes: TreeTransferItem[]): DataNode[] => {
    return nodes.map(node =>
      node.isGroupLevel ? renderGroupNode(node) : renderLeafNode(node)
    )
  }

  return (
    <UI.GroupedTree
      defaultExpandAll
      checkable={false}
      checkedKeys={selectedKeys}
      treeData={generateTree(dataSource as TreeTransferItem[])}
      switcherIcon={(props: AntTreeNodeProps) => {
        return props.expanded
          ? <MinusSquareOutlined size='sm' />
          : <PlusSquareOutlined size='sm' />
      }}
      className={!enableGroupSelect ? 'disable-group-select' : ''}
    />
  )
}
