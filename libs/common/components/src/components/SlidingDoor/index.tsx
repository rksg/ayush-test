import { useState, useEffect, useRef } from 'react'

import { Dropdown } from 'antd'

import { SearchOutlined, CloseSymbol } from '@acx-ui/icons'

import { DropdownList }                 from './dropdownList'
import { searchTree, findMatchingNode } from './helpers'
import * as UI                          from './styledComponents'

export interface Node {
  id?: string;
  name: string;
  type?: string;
  mac?: string;
  children?: Node[];
  path?: Node[];
}

interface RevolvingDoorProps {
  data: Node;
  setNetworkPath: Function;
  defaultSelectedNode?: Node | null;
}

const useBreadcrumbState = (initialBreadcrumb: Node[]) => {
  const [breadcrumb, setBreadcrumb] = useState<Node[]>(initialBreadcrumb)

  const onBreadcrumbClick = (index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1))
  }

  const addNodeToBreadcrumb = (node: Node) => {
    setBreadcrumb([...breadcrumb, node])
  }

  const setBreadcrumbPath = (path: Node[]) => {
    setBreadcrumb(path)
  }

  return { breadcrumb, onBreadcrumbClick, addNodeToBreadcrumb, setBreadcrumbPath }
}

export const RevolvingDoor = (props: RevolvingDoorProps) => {
  const { data: rootNode, setNetworkPath } = props
  const defaultPath = [{ name: 'Network', type: 'network' }]

  const initialBreadcrumb = findMatchingNode(
    rootNode,
    (props?.defaultSelectedNode as unknown as Node[])?.[
      (props.defaultSelectedNode as unknown as Node[]).length - 1
    ]
  )?.path || [rootNode]

  const { breadcrumb, onBreadcrumbClick, addNodeToBreadcrumb, setBreadcrumbPath } =
    useBreadcrumbState(initialBreadcrumb)

  const [searchText, setSearchText] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>(
    breadcrumb.map((node) => node.name).join(' / ')
  )
  const [searchResults, setSearchResults] = useState<Node[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const componentRef = useRef<HTMLDivElement | null>(null)
  const currentNode = breadcrumb[breadcrumb.length - 1]
  const isLeaf = currentNode?.children?.length === 0 || !Boolean(currentNode?.children)

  const onCancel = () => {
    setSearchText('')
    setVisible(false)
    setBreadcrumbPath(initialBreadcrumb)
  }
  const onApply = () => {
    setVisible(false)
    setInputValue(breadcrumb.map((node) => node.name).join(' / '))
    const selectedNodePath = breadcrumb.map((node) => ({ name: node.name, type: node.type }))
    setNetworkPath(selectedNodePath, selectedNodePath)
  }
  const onClose = () => {
    setVisible(false)
    setInputValue(defaultPath.map((node) => node.name).join(' / '))
    setNetworkPath(defaultPath, defaultPath)
    setBreadcrumbPath([rootNode])
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as HTMLElement)) {
      setVisible(false)
    }
  }
  const onSelect = (node: Node) => {
    const isLeaf =
      (currentNode?.children?.length === 0 || !Boolean(currentNode?.children)) &&
      breadcrumb[breadcrumb.length - 1] === node
    const isSameLeafNodeType = breadcrumb[breadcrumb.length - 1].type === node.type
    setSearchResults([])
    setSearchText('')
    if (isLeaf) {
      return
    }
    if (node.path) {
      setBreadcrumbPath(node.path)
    } else {
      isSameLeafNodeType
        ? setBreadcrumbPath([...breadcrumb.slice(0, -1), node])
        : addNodeToBreadcrumb(node)
    }
  }
  const onBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb]
      newBreadcrumb.pop()
      setBreadcrumbPath(newBreadcrumb)
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  useEffect(() => {
    if (searchText) {
      const results = searchTree(rootNode, searchText)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchText, rootNode])

  const nodesToShow = searchText
    ? searchResults
    : breadcrumb.length > 0
      ? isLeaf
        ? breadcrumb?.[breadcrumb.length - 2]?.children
        : breadcrumb?.[breadcrumb.length - 1]?.children
      : []
  const placeHolderText = inputValue.replace(
    new RegExp(defaultPath[0].name, 'i'),
    'Entire Organization'
  )

  return (
    <UI.DropdownWrapper ref={componentRef}>
      <Dropdown
        overlay={
          <DropdownList
            nodesToShow={nodesToShow as Node[]}
            breadcrumb={breadcrumb}
            searchText={searchText}
            currentNode={currentNode}
            onSelect={onSelect}
            onCancel={onCancel}
            onApply={onApply}
            onBack={onBack}
            onBreadcrumbClick={onBreadcrumbClick}
          />
        }
        visible={visible}
        getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}>
        <UI.StyledInput
          prefix={<SearchOutlined />}
          type='search'
          title={placeHolderText}
          placeholder={placeHolderText}
          onClick={() => setVisible(true)}
          onChange={(e) => {
            setSearchText(e.target.value)
          }}
          value={searchText}
          suffix={<CloseSymbol style={{ cursor: 'pointer' }} onClick={onClose} />}
        />
      </Dropdown>
    </UI.DropdownWrapper>
  )
}