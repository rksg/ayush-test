import React, { useState } from 'react'

import { storiesOf }                       from '@storybook/react'
import { Button, Tag, type TransferProps } from 'antd'
import { TransferItem }                    from 'antd/lib/transfer'

import { Transfer } from '.'

storiesOf('Transfer', module)
  .add('Basic', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const handleChange = (newTargetKeys: string[]) => {
      setTargetKeys(newTargetKeys)
    }

    return <div>
      <Transfer
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={[{
          name: 'item1', key: 'item1'
        }, {
          name: 'item2', key: 'item2'
        }, {
          name: 'item3', key: 'item3'
        }, {
          name: 'item4', key: 'item4'
        },{
          name: 'item5', key: 'item5'
        }]}
        render={item => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={targetKeys}
        onChange={handleChange}
      />
    </div>
  })
  .add('No data source', () => {
    return <div>
      <Transfer
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={[]}
        render={item => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={[]}
      />
    </div>
  })
  .add('Table', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const itemOptions = [{
      name: 'item1', key: 'item1'
    }, {
      name: 'item2', key: 'item2'
    }, {
      name: 'item3', key: 'item3'
    }, {
      name: 'item4', key: 'item4'
    },{
      name: 'item5', key: 'item5'
    }] as TransferItem[]

    const leftColumns = [
      {
        dataIndex: 'name',
        title: 'Name'
      },
      {
        dataIndex: 'key',
        title: 'key'
      },
      {
        dataIndex: 'key',
        title: 'Tag',
        render: (tag: string) => (
          <Tag style={{ marginInlineEnd: 0 }} color='cyan'>
            {tag.toUpperCase()}
          </Tag>
        )
      }
    ]

    const rightColumns = [
      {
        dataIndex: 'name',
        title: 'Name'
      }
    ]

    const handleChange = (newTargetKeys: string[]) => {
      setTargetKeys(newTargetKeys)
    }

    return <div>
      <Transfer
        listStyle={{ width: 400, height: 400 }}
        type={'table'}
        tableData={itemOptions}
        leftColumns={leftColumns}
        rightColumns={rightColumns}
        showSearch
        showSelectAll={false}
        filterOption={(inputValue, item) =>
          Object.keys(item).some(key => {
            // eslint-disable-next-line max-len
            return (item[key] && item[key].toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
          })
        }
        dataSource={itemOptions}
        render={item => item.name}
        onChange={handleChange}
        targetKeys={targetKeys}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
      />
    </div>
  })
  .add('Table with footer', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [isHide, setIsHide] = useState(false)
    const [tableDataOption, setTableDataOption] = useState([{
      name: 'item1', key: 'item1'
    }, {
      name: 'item2', key: 'item2'
    }, {
      name: 'item3', key: 'item3'
    }, {
      name: 'item4', key: 'item4'
    },{
      name: 'item5', key: 'item5'
    }] as TransferItem[])

    const itemOptions = [{
      name: 'item1', key: 'item1'
    }, {
      name: 'item2', key: 'item2'
    }, {
      name: 'item3', key: 'item3'
    }, {
      name: 'item4', key: 'item4'
    },{
      name: 'item5', key: 'item5'
    }]

    const leftColumns = [
      {
        dataIndex: 'name',
        title: 'Name'
      },
      {
        dataIndex: 'key',
        title: 'key'
      },
      {
        dataIndex: 'key',
        title: 'Tag',
        render: (tag: string) => (
          <Tag style={{ marginInlineEnd: 0 }} color='cyan'>
            {tag.toUpperCase()}
          </Tag>
        )
      }
    ]

    const rightColumns = [
      {
        dataIndex: 'name',
        title: 'Name'
      }
    ]

    const handleChange = (newTargetKeys: string[]) => {
      setTargetKeys(newTargetKeys)
    }

    const renderFooter: TransferProps<TransferItem>['footer'] = (_, info) => {
      if (info?.direction === 'left') {
        return (
          <Button
            size='small'
            style={{ display: 'flex', margin: 8, marginInlineEnd: 'auto', fontSize: '13px' }}
            type={'link'}
            onClick={() => {
              if (isHide) {
                setTableDataOption(itemOptions)
              } else {
                setTableDataOption(itemOptions.filter(
                  option => {
                    const match = option.name.match(/\d+/)
                    return match && Number(match[0]) % 2 !== 0
                  }
                ))
              }
              setIsHide(!isHide)
            }}
          >
            {isHide ? 'Show even number ID' : 'Hide even number ID'}
          </Button>
        )
      }
      return <></>
    }

    return <div>
      <Transfer
        listStyle={{ width: 400, height: 400 }}
        type={'table'}
        tableData={tableDataOption}
        leftColumns={leftColumns}
        rightColumns={rightColumns}
        showSearch
        showSelectAll={false}
        filterOption={(inputValue, item) =>
          Object.keys(item).some(key => {
            // eslint-disable-next-line max-len
            return (item[key] && item[key].toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
          })
        }
        dataSource={itemOptions as TransferItem[]}
        render={item => item.name}
        onChange={handleChange}
        targetKeys={targetKeys}
        footer={renderFooter}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
      />
    </div>
  })
  .add('Grouped Tree Transfer', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    const data = [
      {
        key: 'group-1',
        name: 'Group 1',
        isGroupLevel: true,
        children: [
          { key: 'group-1-item-1', name: 'Item 1' },
          { key: 'group-1-item-2', name: 'Item 2' },
          { key: 'group-1-item-3', name: 'Item 3' },
          { key: 'group-1-item-4', name: 'Item 4' },
          { key: 'group-1-item-5', name: 'Item 5' }
        ]
      },
      {
        key: 'group-2',
        name: 'Group 2',
        isGroupLevel: true,
        children: [
          { key: 'group-2-item-1', name: 'Item 1' },
          { key: 'group-2-item-2', name: 'Item 2' },
          { key: 'group-2-item-3', name: 'Item 3' },
          { key: 'group-2-item-4', name: 'Item 4' }
        ]
      }
    ]

    return <div>
      <Transfer
        type='grouped-tree'
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={data}
        render={(item) => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
        selectedKeys={selectedKeys}
        onSelectChange={(source, target) => setSelectedKeys([...source, ...target])}
      />
      <Transfer
        type='grouped-tree'
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={data}
        render={(item) => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
        selectedKeys={selectedKeys}
        onSelectChange={(source, target) => setSelectedKeys([...source, ...target])}
        enableGroupSelect={true}
        enableMultiselect={true}
      />
      <Transfer
        type='grouped-tree'
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={data}
        render={(item) => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
        selectedKeys={selectedKeys}
        onSelectChange={(source, target) => setSelectedKeys([...source, ...target])}
        enableMultiselect={false}
      />
    </div>
  })

export {}
