import { Checkbox, Radio, Tree } from 'antd'
import { TransferItem }          from 'antd/lib/transfer'

import type { TransferListBodyProps } from 'antd/es/transfer/ListBody'

export function flattenTree (treeData: TransferItem[]): TransferItem[] {
  const result: TransferItem[] = []

  const traverse = (nodes: TransferItem[]) => {
    nodes.forEach((node) => {
      if (node.children) {
        traverse(node.children)
      } else {
        result.push(node)
      }
    })
  }

  traverse(treeData)
  return result
}

export function filterTree (treeData: TransferItem[], search: string): TransferItem[] {
  const lowerSearch = search?.toLowerCase() || ''

  const filter = (nodes: TransferItem[]): TransferItem[] => {
    const result: TransferItem[] = []

    nodes.forEach((node) => {
      const name = (node.name || node.title || '').toString().toLowerCase()
      const children = node.children ? filter(node.children) : []

      if (name.includes(lowerSearch) || children.length > 0) {
        result.push({
          ...node,
          children
        })
      }
    })

    return result
  }

  return search ? filter(treeData) : treeData
}

export function renderTransferGroupedTree (
  props: TransferProps,
  transferProps: TransferListBodyProps<TransferItem>,
  searchText: string
) {
  const { direction } = transferProps
  if (direction === 'right') {
    return null
  }

  const dataSource = props.dataSource || []
  const targetKeys = props.targetKeys || []
  const selectedKeys = props.selectedKeys || []
  //const onTargetKeysChange = props.onChange
  const onSelectedKeysChange = props.onSelectChange

  const enableGroupSelect = props.enableGroupSelect ?? false
  const enableMultiselect = props.enableMultiselect ?? true
  const disableGroupSelect = !enableGroupSelect || !enableMultiselect

  const filteredTreeData = filterTree(dataSource, searchText) //TODO: after canel

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
      const newSelectedKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key]
      onSelectedKeysChange?.(newSelectedKeys, [])
    } else {
      onSelectedKeysChange?.([key], [])
    }
  }

  const getChildrenKeys = (groupKey: string) => {
    const group = dataSource.find((g: TransferItem) => g.key === groupKey)
    return group?.children?.map((child: TransferItem) => child.key) || []
  }

  const handleGroupCheck = (groupKey: string) => {
    const childrenKeys = getChildrenKeys(groupKey)
    const isAllSelected = childrenKeys.every((key: string) => selectedKeys.includes(key))
    const newSelectedKeys = isAllSelected
      ? selectedKeys.filter((key) => !childrenKeys.includes(key))
      : Array.from(new Set([...selectedKeys, ...childrenKeys]))
    onSelectedKeysChange?.(newSelectedKeys, [])
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
              {typeof node.name === 'string' ? node.name : node.title}
            </div>
          ),
          children: generateTree(children)
        }
      }

      const [groupKey] = key?.split('-item-')
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
            {typeof node.name === 'string' ? node.name : node.title}
          </div>
        )
      }
    })

  return (
    <Tree
      defaultExpandAll
      checkable={false}
      checkedKeys={selectedKeys}
      // treeData={generateTree(dataSource)}
      treeData={generateTree(filteredTreeData)}
    />
  )
}
