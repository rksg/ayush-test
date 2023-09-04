import { useState, useEffect } from 'react'

import { Dropdown } from 'antd'
import { useIntl }  from 'react-intl'

import { SearchOutlined } from '@acx-ui/icons'

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
  defaultSelected?: boolean;
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
  const { $t } = useIntl()

  const initialBreadcrumb = findMatchingNode(
    rootNode,
    (props?.defaultSelectedNode as unknown as Node[])?.[
      (props.defaultSelectedNode as unknown as Node[]).length - 1
    ]
  )?.path || [rootNode]

  const {
    breadcrumb,
    onBreadcrumbClick,
    addNodeToBreadcrumb,
    setBreadcrumbPath
  } = useBreadcrumbState(initialBreadcrumb)

  const [searchText, setSearchText] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>(
    breadcrumb.map((node) => node.name).join(' / ')
  )
  const [searchResults, setSearchResults] = useState<Node[]>([])
  const [visible, setVisible] = useState<boolean>(false)

  const onCancel = () => {
    setSearchText('')
    setInputValue(breadcrumb.map((node) => node.name).join(' / '))
    setVisible(false)
  }

  const onApply = () => {
    setVisible(false)
    setInputValue(breadcrumb.map((node) => node.name).join(' / '))
    const selectedNodePath = breadcrumb.map((node) => ({ name: node.name, type: node.type }))
    setNetworkPath(selectedNodePath, selectedNodePath)
  }

  useEffect(() => {
    if (searchText) {
      const results = searchTree(rootNode, searchText)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchText, rootNode])

  const onSelect = (node: Node) => {
    setSearchResults([])
    setSearchText('')

    if (node.path) {
      setBreadcrumbPath(node.path)
    } else {
      addNodeToBreadcrumb(node)
    }
  }
  const onBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb]
      newBreadcrumb.pop()
      setBreadcrumbPath(newBreadcrumb)
    }
  }
  const currentNode = breadcrumb[breadcrumb.length - 1]
  const nodesToShow = searchText
    ? searchResults
    : breadcrumb.length > 0
      ? breadcrumb[breadcrumb.length - 1].children
      : []

  return (
    <UI.DropdownWrapper>
      <Dropdown
        overlay={<DropdownList
          nodesToShow={nodesToShow as Node[]}
          breadcrumb={breadcrumb}
          searchText={searchText}
          currentNode={currentNode}
          onSelect={onSelect}
          onCancel={onCancel}
          onApply={onApply}
          onBack={onBack}
          onBreadcrumbClick={onBreadcrumbClick}
        />}
        visible={visible}
      >
        <UI.StyledInput
          prefix={<SearchOutlined />}
          type='search'
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          onClick={() => setVisible(true)}
          onChange={(e) => { setSearchText(e.target.value); setInputValue(e.target.value) }}
          value={inputValue}
          allowClear
        />
      </Dropdown>
    </UI.DropdownWrapper>
  )
}