import React, { useState, useEffect, useRef } from 'react'

import { Dropdown, Menu } from 'antd'
import {
  Breadcrumb
} from 'antd'
import { capitalize } from 'lodash'

import { Button } from '../Button'

import * as UI from './styledComponents'

interface Node {
  id?: string;
  name: string;
  type?: string;
  mac?: string;
  children?: Node[];
  path?: Node[];
  defaultSelected?: boolean;
}

const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = []
  if (node?.name?.toLowerCase().includes(searchText.toLowerCase())) {
    results.push({ ...node, path: [...path, node] })
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results = results.concat(searchTree(child, searchText, [...path, node]))
    }
  }
  return results
}
const findMatchingNode = (
  node: Node,
  targetNode: Node | null | undefined,
  path: Node[] = []
): Node | null => {
  if (targetNode && node.name === targetNode.name && node.type === targetNode.type) {
    return { ...node, path: [...path, node] }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findMatchingNode(child, targetNode, [...path, node])
      if (result) {
        return result
      }
    }
  }
  return null
}

interface Props {
  node: Node;
  onClick: (node: Node) => void;
  selectedNode: Node | null;
}
const ListItemComponent: React.FC<Props> = ({ node, onClick, selectedNode }) => {
  const isLeaf = node?.children?.length === 0 || !Boolean(node?.children)
  const isSelected = selectedNode?.mac === node?.mac && Boolean(selectedNode?.mac && node?.mac)
  return (
    <UI.ListItem
      key={`${node?.type}-${node.name}`}
      onClick={() => onClick(node)}
      isSelected={isSelected}>
      <UI.ListItemSpan>{`${node.type ? `${node.type}(` : ''}${node.name}${
        node.type ? ')' : ''
      }`}</UI.ListItemSpan>
      <div>{!isLeaf && <UI.RightArrow />}</div>
    </UI.ListItem>
  )
}
interface RevolvingDoorProps {
  data: Node;
  setNetworkPath: Function;
  defaultSelectedNode?: Node | null;
}export const RevolvingDoor = (props: RevolvingDoorProps) => {
  const rootNode = props?.data
  const matchingNode = findMatchingNode(
    rootNode,
    (
      props?.defaultSelectedNode as unknown as Node[]
    )?.[(props.defaultSelectedNode as unknown as Node[]).length - 1 ])
  const ref = useRef(null)

  const [breadcrumb, setBreadcrumb] = useState<Node[]>(
    matchingNode?.path ? matchingNode.path : [rootNode]
  )
  const [selectedNode, setSelectedNode] = useState<Node | null>(
    matchingNode ? matchingNode : null
  )
  const [searchText, setSearchText] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Node[]>([])
  const [visible, setVisible] = useState<boolean>(false)

  const onCancel = () => {
    setSearchText('')
    setVisible(false)
  }
  const onApply = () => {
    setVisible(false)
    const selectedNodePath = breadcrumb.map((node) => ({ name: node.name, type: node.type }))
    props.setNetworkPath(selectedNodePath, selectedNodePath)
  }
  const handleClickOutside = (event: MouseEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(ref?.current as any)?.contains(event.target)) {
      setVisible(false)
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
  const onSelect = (node: Node) => {
    const isLeaf = node?.children?.length === 0 || !Boolean(node?.children)
    setSelectedNode(node)
    setSearchResults([])
    setSearchText('')
    if (isLeaf) {
      return
    }
    if (node.path) {
      setBreadcrumb(node.path)
    } else {
      setBreadcrumb([...breadcrumb, node])
    }
  }

  const onBreadcrumbClick = (index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1))
  }

  const onBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb]
      newBreadcrumb.pop()
      setBreadcrumb(newBreadcrumb)
    }
  }
  const currentNode = breadcrumb[breadcrumb.length - 1]
  const nodesToShow = searchText
    ? searchResults
    : breadcrumb.length > 0
      ? breadcrumb[breadcrumb.length - 1].children
      : []
  const dropDownHeader = (
    <>
      <UI.ListHeader onClick={onBack}>
        {breadcrumb.length > 1 && !searchText && <UI.LeftArrow />}
        <UI.LeftArrowText hasLeftArrow={!Boolean(breadcrumb.length > 1 && !searchText)}>
          {searchText
            ? 'Search Results'
            : capitalize(
              currentNode?.type && currentNode.type.toLowerCase() !== 'network'
                ? `${currentNode.type}(${currentNode.name}) `
                : currentNode.name
            )}
        </UI.LeftArrowText>
      </UI.ListHeader>
      <UI.StyledBreadcrumb>
        {!searchText &&
          breadcrumb.map((node, index) => (
            <Breadcrumb.Item key={index} onClick={() => onBreadcrumbClick(index)}>
              {index !== breadcrumb.length - 1
                ? capitalize(
                  node?.type && node.type.toLowerCase() !== 'network'
                    ? `${node.type}(${node.name}) `
                    : node.name
                )
                : ''}
            </Breadcrumb.Item>
          ))}
      </UI.StyledBreadcrumb>
    </>
  )
  const dropDownFooter = (
    <UI.ButtonDiv>
      <Button size='small' onClick={onCancel}>
        {'Cancel'}
      </Button>
      <Button size='small' type='primary' onClick={onApply}>
        {'Apply'}
      </Button>
    </UI.ButtonDiv>
  )
  const dropDownList = (
    <UI.StyledMenu >
      <Menu.Item key='1'>
        <UI.StyledList
          split={false}
          header={dropDownHeader}
          footer={dropDownFooter}
          dataSource={nodesToShow as Node[]}
          renderItem={(node) => (
            <ListItemComponent node={node as Node} onClick={onSelect} selectedNode={selectedNode} />
          )}
        />
      </Menu.Item>
    </UI.StyledMenu>
  )
  return (
    <div ref={ref}>
      <Dropdown
        overlay={dropDownList}
        visible={visible}>
        <UI.StyledInput
          placeholder='Search...'
          onClick={() => setVisible(true)}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText ? searchText : breadcrumb.map(node => node.name).join(' > ')}
        />
      </Dropdown>
    </div>
  )
}