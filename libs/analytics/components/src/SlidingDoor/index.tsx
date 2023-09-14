import { useState, useEffect, useRef } from 'react'

import { Dropdown } from 'antd'
import { useIntl }  from 'react-intl'

import { SearchOutlined, CloseSymbol, CaretDownSolid } from '@acx-ui/icons'

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
  list?: string[]
}

interface SlidingDoorProps {
  data: Node;
  setNetworkPath: Function;
  defaultSelectedNode?: Node | null;
}

const useBreadcrumbState = (initialBreadcrumb: Node[], cb: CallableFunction) => {
  const [breadcrumb, setBreadcrumb] = useState<Node[]>(initialBreadcrumb)

  const onBreadcrumbClick = (index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1))
    cb(false)
  }

  const addNodeToBreadcrumb = (node: Node) => {
    setBreadcrumb([...breadcrumb, node])
  }

  const setBreadcrumbPath = (path: Node[]) => {
    setBreadcrumb(path)
  }

  return { breadcrumb, onBreadcrumbClick, addNodeToBreadcrumb, setBreadcrumbPath }
}

export const SlidingDoor = (props: SlidingDoorProps) => {
  const { $t } = useIntl()
  const { data: rootNode, setNetworkPath } = props
  const defaultPath = [{ name: 'Network', type: 'network' }]

  const initialBreadcrumb = findMatchingNode(
    rootNode,
    (props?.defaultSelectedNode as unknown as Node[])?.[
      (props.defaultSelectedNode as unknown as Node[]).length - 1
    ]
  )?.path || [rootNode]
  const [isAnimationSlideIn, setIsAnimationSlideIn] = useState(true)
  const { breadcrumb, onBreadcrumbClick, addNodeToBreadcrumb, setBreadcrumbPath } =
    useBreadcrumbState(initialBreadcrumb, setIsAnimationSlideIn)
  const breadcrumbToInputValue = () => breadcrumb.slice(1).map(node => node.name).join(' / ')
  const [searchText, setSearchText] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>(breadcrumbToInputValue())
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
    setInputValue(breadcrumbToInputValue())
    const selectedNodePath = breadcrumb.map((node) => {
      const nodeInfo = {
        name: node.name,
        type: node.type
      }
      const apOrSwitchInfo = node.type === 'ap' || node.type === 'switch'
        ? { list: [node?.mac] }
        : {}
      return {
        ...nodeInfo,
        ...apOrSwitchInfo
      }
    })
    setNetworkPath(selectedNodePath, selectedNodePath)
  }
  const onClose = () => {
    setVisible(false)
    setSearchText('')
    setInputValue('')
    setNetworkPath(defaultPath, defaultPath)
    setBreadcrumbPath([rootNode])
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (componentRef.current && !componentRef.current.contains(event.target as HTMLElement)) {
      setVisible(false)
    }
  }
  const onSelect = (node: Node) => {
    setSearchResults([])
    setSearchText('')
    setIsAnimationSlideIn(true)
    if (node.path) {
      setBreadcrumbPath(node.path)
    } else {
      breadcrumb[breadcrumb.length - 1].type === node.type
        ? setBreadcrumbPath([...breadcrumb.slice(0, -1), node])
        : addNodeToBreadcrumb(node)
    }
  }
  const onBack = () => {
    const newBreadcrumb = [...breadcrumb]
    newBreadcrumb.pop()
    setBreadcrumbPath(newBreadcrumb)
    setIsAnimationSlideIn(false)
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  useEffect(() => {
    if (searchText) {
      const results = searchTree(rootNode, searchText.toLowerCase())
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchText, rootNode])

  const nodesToShow = searchText
    ? searchResults
    : breadcrumb?.[breadcrumb.length - (isLeaf ? 2 : 1)]?.children
  const placeHolderText = inputValue || $t({ defaultMessage: 'Entire Organization' })
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
            animation={searchText ? 'none' : (isAnimationSlideIn ? 'rtl' : 'ltr')}
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
          suffix={visible || searchText || inputValue
            ? <CloseSymbol style={{ cursor: 'pointer' }} onClick={onClose} />
            : <CaretDownSolid />
          }
        />
      </Dropdown>
    </UI.DropdownWrapper>
  )
}