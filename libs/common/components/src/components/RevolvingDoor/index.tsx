import React, { useState, useEffect } from 'react'


import { Dropdown, Menu, Input } from 'antd'
import {
  Breadcrumb
} from 'antd'
import { capitalize } from 'lodash'

import { Button } from '@acx-ui/components'

import * as UI from './styledComponents'

interface Node {
  id?: string;
  name: string;
  type?: string;
  mac?: string;
  P1?: number;
  P2?: number;
  P3?: number;
  P4?: number;
  children?: Node[];
  path?: Node[];
}

const searchTree = (node: Node, searchText: string, path: Node[] = []): Node[] => {
  let results: Node[] = [];
  if (node?.name?.toLowerCase().includes(searchText.toLowerCase())) {
    results.push({ ...node, path: [...path, node] });
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results = results.concat(searchTree(child, searchText, [...path, node]));
    }
  }
  return results;
};

interface Props {
  node: Node;
  onClick: (node: Node) => void;
}
const ListItemComponent: React.FC<Props> = ({ node, onClick }) => {
  const isLeaf = node?.children?.length === 0 || !Boolean(node?.children);

  return (
    <UI.ListItem key={`${node?.type}-${node.name}`} onClick={() => !isLeaf && onClick(node)}>
      <UI.ListItemSpan>{`${node.type ? `${node.type}(` : ''}${node.name}${
        node.type ? ')' : ''
      }`}</UI.ListItemSpan>
      <div style={{ verticalAlign: 'middle' }}>{!isLeaf && <UI.RightArrow />}</div>
    </UI.ListItem>
  );
};
export const TestComponent = () => {
  const rootNode: Node = {
    id: '1',
    name: 'Network',
    children: [
      {
        id: '2',
        name: 'APs',
        children: [
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
                            mac: '00:E6:3A:1E:5C:60',
                          },
                          {
                            name: 'R750-Solution-1',
                            type: 'ap',
                            mac: '28:B3:71:2B:D8:30',
                          },
                          {
                            name: 'R750-Solution-2',
                            type: 'ap',
                            mac: '28:B3:71:2B:D8:34',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
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
                        mac: '94:B3:4F:2F:7D:0A',
                      },
                      {
                        name: 'ICX8200-C08ZP Router2',
                        type: 'switch',
                        mac: '94:B3:4F:2F:7D:0L',
                      },
                      {
                        name: 'ICX8200-48ZP2 Router',
                        type: 'switch',
                        mac: '94:B3:4F:2F:C6:4E',
                      },
                    ],
                  },
                  {
                    name: 'EASTBLOCK',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'ICX7450-32ZP Router',
                        type: 'switch',
                        mac: '60:9C:9F:1D:D3:30',
                      },
                    ],
                  },
                  {
                    name: 'WESTBLOCK',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'ICX7150-C12 Router',
                        type: 'switch',
                        mac: '58:FB:96:0B:12:CA',
                      },
                    ],
                  },
                ],
              },
            ],
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
                        mac: '78:A6:E1:1C:83:24',
                      },
                    ],
                  },
                  {
                    name: 'Managed Switches',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'NET35XX-CORE',
                        type: 'switch',
                        mac: '60:9C:9F:22:E8:80',
                      },
                    ],
                  },
                  {
                    name: 'NET37XX',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'NET37XX-CORE',
                        type: 'switch',
                        mac: '8C:7A:15:3C:DC:28',
                      },
                    ],
                  },
                  {
                    name: 'OLT-Commscope',
                    type: 'switchGroup',
                    children: [
                      {
                        name: 'OLT-Access-ONU1',
                        type: 'switch',
                        mac: '60:9C:9F:FE:5B:78',
                      },
                      {
                        name: 'OLT-7550-Distribution',
                        type: 'switch',
                        mac: '8C:7A:15:3C:CA:1C',
                      },
                    ],
                  },
                ],
              },
            ],
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
                        P4: 0,
                      },
                      {
                        name: 'east-icxstack-density',
                        type: 'switch',
                        mac: '60:9C:9F:FE:56:42',
                      },
                      {
                        name: 'density-main-switch',
                        type: 'switch',
                        mac: '60:9C:9F:FE:64:14',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const [breadcrumb, setBreadcrumb] = useState<Node[]>([rootNode]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  useEffect(() => {
    if (searchText) {
      const results = searchTree(rootNode, searchText);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);
  const onSelect = (node: Node) => {
    if (node.path) {
      setBreadcrumb(node.path);
    } else {
      setBreadcrumb([...breadcrumb, node]);
    }
    setSearchResults([]);
    setSearchText('');
  };

  const onBreadcrumbClick = (index: number) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  };

  const onBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb];
      newBreadcrumb.pop();
      setBreadcrumb(newBreadcrumb);
    }
  };
  const currentNode = breadcrumb[breadcrumb.length - 1];
  const nodesToShow = searchText
    ? searchResults
    : breadcrumb.length > 0
    ? breadcrumb[breadcrumb.length - 1].children
    : [];
  const dropDownHeader = (
    <>
      <UI.ListHeader onClick={onBack}>
        {breadcrumb.length > 1 && <UI.LeftArrow />}
        <UI.LeftArrowText hasLeftArrow={!Boolean(breadcrumb.length > 1)}>
          {searchText
            ? 'Search Results'
            : capitalize(
                currentNode?.type ? `${currentNode.type}(${currentNode.name}) ` : currentNode.name
              )}
        </UI.LeftArrowText>
      </UI.ListHeader>
      <UI.StyledBreadcrumb>
        {breadcrumb.map((node, index) => (
          <Breadcrumb.Item key={index} onClick={() => onBreadcrumbClick(index)}>
            {index !== breadcrumb.length - 1
              ? capitalize(node?.type ? `${node.type}(${node.name}) ` : node.name)
              : ''}
          </Breadcrumb.Item>
        ))}
      </UI.StyledBreadcrumb>
    </>
  );
  const dropDownFooter = (
    <UI.ButtonDiv>
      <Button size="small" onClick={() => {}}>
        {'Cancel'}
      </Button>
      <Button size="small" type="primary" onClick={() => {}}>
        {'Apply'}
      </Button>
    </UI.ButtonDiv>
  );
  const dropDownList = (
    <UI.StyledMenu>
      <Menu.Item key="1">
        <UI.StyledList
          split={false}
          header={dropDownHeader}
          footer={dropDownFooter}
          dataSource={nodesToShow as Node[]}
          renderItem={(node) => <ListItemComponent node={node as Node} onClick={onSelect} />}
        />
      </Menu.Item>
    </UI.StyledMenu>
  );
  return (
    <Dropdown overlay={dropDownList} visible={true} onVisibleChange={handleVisibleChange}>
      <Input
        placeholder="Search..."
        onClick={() => setVisible(!visible)}
        style={{ cursor: 'pointer' }}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </Dropdown>
  );
};