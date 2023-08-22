import React, { useState, useEffect, useRef } from 'react'


import { Dropdown, Menu, List, Input } from 'antd'
import {
  Breadcrumb
} from 'antd'
import { capitalize } from 'lodash'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

import { Divider } from '../Table/styledComponents'

import { SeveritySpan } from './styledComponents'

const searchTree = (node, searchText) => {
  let results = []
  if (node?.name?.toLowerCase().includes(searchText?.toLowerCase())) {
    results.push(node)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results = results.concat(searchTree(child, searchText))
    }
  }

  return results
}

export const TestComponent = () => {
  const rootNode = {
    id: '1',
    name: 'Network',
    children: [
      {
        id: '2',
        name: 'APs',
        children: [
          {
            name: 'Alphanet-BDC',
            type: 'system',
            P1: 0,
            P2: 0,
            P3: 0,
            P4: 1,
            children: [
              {
                name: 'Administration Domain',
                type: 'domain',
                P1: 0,
                P2: 0,
                P3: 0,
                P4: 1,
                children: [
                  {
                    name: 'AlphaNet_5_1',
                    type: 'zone',
                    children: [
                      {
                        name: 'default',
                        type: 'apGroup',
                        children: [
                          {
                            name: 'W_04',
                            type: 'ap',
                            mac: '0C:F4:D5:13:3A:F0'
                          },
                          {
                            name: 'E-02-BKP',
                            type: 'ap',
                            mac: '0C:F4:D5:18:40:30'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    name: 'Default Zone',
                    type: 'zone',
                    P1: 0,
                    P2: 0,
                    P3: 0,
                    P4: 1,
                    children: [
                      {
                        name: 'default',
                        type: 'apGroup',
                        children: [
                          {
                            name: 'W-04',
                            type: 'ap',
                            mac: '0C:F4:D5:13:3A:F0'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'BDC-Mini-Density',
            P1: 0,
            P2: 0,
            P3: 0,
            P4: 1,
            type: 'system',
            children: [
              {
                name: 'BDC Domain',
                type: 'domain',
                children: [
                  {
                    name: 'Solution LAB',
                    type: 'zone',
                    children: [
                      {
                        name: 'default',
                        type: 'apGroup',
                        children: [
                          {
                            name: 'R550-Solution-2',
                            type: 'ap',
                            mac: '00:E6:3A:1E:5C:60'
                          },
                          {
                            name: 'R750-Solution-1',
                            type: 'ap',
                            mac: '28:B3:71:2B:D8:30'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '3',
        name: 'Switches',
        children: [
          {
            name: 'Alphanet-BDC',
            type: 'system',
            P1: 0,
            P2: 0,
            P3: 0,
            P4: 1,
            children: [
              {
                name: 'Administration Domain',
                type: 'domain',
                P1: 0,
                P2: 0,
                P3: 0,
                P4: 1,
                children: [
                  {
                    name: 'Default Group',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'ICX8200-C08ZP Router',
                        type: 'switch',
                        mac: '94:B3:4F:2F:7D:0A'
                      },
                      {
                        name: 'ICX8200-48ZP2 Router',
                        type: 'switch',
                        mac: '94:B3:4F:2F:C6:4E'
                      }
                    ]
                  },
                  {
                    name: 'EASTBLOCK',
                    type: 'switchGroup',
                    children: [
                      [
                        {
                          name: 'ICX7450-32ZP Router',
                          type: 'switch',
                          mac: '60:9C:9F:1D:D3:30'
                        }
                      ]
                    ]
                  },
                  {
                    name: 'WESTBLOCK',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'ICX7150-C12 Router',
                        type: 'switch',
                        mac: '58:FB:96:0B:12:CA'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'ICXM-Scale',
            type: 'system',
            children: [
              {
                name: 'SQA Sunnyvale',
                type: 'domain',
                children: [
                  {
                    name: 'MDU Chamber',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'Access-Wired',
                        type: 'switch',
                        mac: '78:A6:E1:1C:83:24'
                      }
                    ]
                  },
                  {
                    name: 'Managed Switches',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'NET35XX-CORE',
                        type: 'switch',
                        mac: '60:9C:9F:22:E8:80'
                      }
                    ]
                  },
                  {
                    name: 'NET37XX',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'NET37XX-CORE',
                        type: 'switch',
                        mac: '8C:7A:15:3C:DC:28'
                      }
                    ]
                  },
                  {
                    name: 'OLT-Commscope',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'OLT-Access-ONU1',
                        type: 'switch',
                        mac: '60:9C:9F:FE:5B:78'
                      },
                      {
                        name: 'OLT-7550-Distribution',
                        type: 'switch',
                        mac: '8C:7A:15:3C:CA:1C'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'density-vsze-cluster',
            type: 'system',
            P1: 1,
            P2: 0,
            P3: 0,
            P4: 0,
            children: [
              {
                name: 'Administration Domain',
                type: 'domain',
                P1: 1,
                P2: 0,
                P3: 0,
                P4: 0,
                children: [
                  {
                    name: 'Density',
                    type: 'switchGroup',
                    P1: 1,
                    P2: 0,
                    P3: 0,
                    P4: 0,
                    children: [
                      {
                        name: 'west-density-7650-stack',
                        type: 'switch',
                        mac: '60:9C:9F:52:C9:86',
                        P1: 1,
                        P2: 0,
                        P3: 0,
                        P4: 0
                      },
                      {
                        name: 'east-icxstack-density',
                        type: 'switch',
                        mac: '60:9C:9F:FE:56:42'
                      },
                      {
                        name: 'density-main-switch',
                        type: 'switch',
                        mac: '60:9C:9F:FE:64:14'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  const [breadcrumb, setBreadcrumb] = useState([rootNode])
  const [checkedNodes, setCheckedNodes] = useState({})
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)

  const handleVisibleChange = flag => {
    setVisible(flag)
  }

  useEffect(() => {
    if (searchText) {
      let results = []
      for (const node of [...rootNode]) {
        results = results.concat(searchTree(node, searchText))
      }
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchText])
  const onSelect = (node) => {
    setBreadcrumb([...breadcrumb, node])
  }

  const onBreadcrumbClick = (index) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1))
  }

  const onToggleCheck = (nodeId) => {
    setCheckedNodes(prevCheckedNodes => ({
      ...prevCheckedNodes,
      [nodeId]: !prevCheckedNodes[nodeId]
    }))
  }

  const onBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb]
      newBreadcrumb.pop()
      setBreadcrumb(newBreadcrumb)
    }
  }

  const currentNode = breadcrumb[breadcrumb.length - 1]
  const nodesToShow = searchText ? searchResults : (breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].children : [...rootNode])

  const menu = (
    <Menu>
      <Menu.Item key='1'>
        <List
          header={<>
            <span style={{ display: 'inline-block',
              verticalAlign: 'middle' }}>
              {breadcrumb.length > 1 && (
                <>
                  <ArrowChevronLeft onClick={onBack}
                    style={{ display: 'inline-block',
                      verticalAlign: 'middle' }}/>
                  <span style={{ display: 'inline-block',
                    verticalAlign: 'middle' }}>{capitalize(currentNode?.type
                      ? `${currentNode.type}(${currentNode.name}) `
                      : currentNode.name)}</span>
                </>
              )}
            </span>
            {/* Breadcrumb */}
            <Breadcrumb>
              {breadcrumb.map((node, index) => (
                <Breadcrumb.Item key={index} onClick={() => onBreadcrumbClick(index)}>
                  {capitalize(node?.type
                    ? `${node.type}(${node.name}) `
                    : node.name)}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb></>}
          dataSource={nodesToShow}
          renderItem={childNode => {
            const isLeaf = childNode?.children?.length === 0 || !Boolean(childNode?.children)

            const handleNodeClick = () => {
              if (!isLeaf) {
                onSelect(childNode)
              }
            }
            return <List.Item key={childNode.name}
            >
              <span onClick={handleNodeClick}>
                <input
                  style={{ width: 20 }}
                  type='checkbox'
                  checked={!!checkedNodes[childNode.name]}
                  onChange={() => onToggleCheck(childNode.id)}
                />
                {capitalize(childNode?.type
                  ? `${childNode.type}(${childNode.name}) `
                  : childNode.name)}
              </span>
              <div style={{
                verticalAlign: 'middle' }}>
                { <SeveritySpan style={{
                  verticalAlign: 'middle' }}> {1}</SeveritySpan> }
                { !isLeaf && <ArrowChevronRight style={{
                  verticalAlign: 'middle' }}/> }
              </div>

            </List.Item>
          }
          }
        />

      </Menu.Item>
    </Menu>
  )
  return (
    <div>
      {/* Search Box */}
      {/* <div>
        <input
          type='text'
          placeholder='Search...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div> */}
      <Dropdown overlay={menu} visible={true} onVisibleChange={handleVisibleChange}>
        <Input
          placeholder='Search...'
          ref={inputRef}
          onClick={() => setVisible(!visible)}
          style={{ cursor: 'pointer' }}
        />
      </Dropdown>
    </div>
  )
}

