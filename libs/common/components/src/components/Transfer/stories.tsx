import React, { useState } from 'react'

import { storiesOf }                       from '@storybook/react'
import { Button, Tag, type TransferProps } from 'antd'
import { TransferItem }                    from 'antd/lib/transfer'

import { Transfer, TransferType } from '.'

const mockData = [{
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

const tableLeftColumns = [{
  dataIndex: 'name',
  title: 'Name'
}, {
  dataIndex: 'key',
  title: 'key'
}, {
  dataIndex: 'key',
  title: 'Tag',
  render: (tag: string) => (
    <Tag style={{ marginInlineEnd: 0 }} color='cyan'>
      {tag.toUpperCase()}
    </Tag>
  )
}]

const tableRightColumns = [{
  dataIndex: 'name',
  title: 'Name'
}]

const treeData = [{
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
}, {
  key: 'group-2',
  name: 'Group 2',
  isGroupLevel: true,
  children: [
    { key: 'group-2-item-1', name: 'Item 1' },
    { key: 'group-2-item-2', name: 'Item 2' },
    { key: 'group-2-item-3', name: 'Item 3' },
    { key: 'group-2-item-4', name: 'Item 4' }
  ]
}]

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
        dataSource={mockData}
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
    const itemOptions = mockData as TransferItem[]
    const leftColumns = tableLeftColumns
    const rightColumns = tableRightColumns

    const handleChange = (newTargetKeys: string[]) => {
      setTargetKeys(newTargetKeys)
    }

    return <div>
      <Transfer
        listStyle={{ width: 400, height: 400 }}
        type={TransferType.TABLE}
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
    const [tableDataOption, setTableDataOption] = useState(mockData as TransferItem[])

    const itemOptions = mockData
    const leftColumns = tableLeftColumns
    const rightColumns = tableRightColumns

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
      return <> </>
    }

    return <div>
      <Transfer
        listStyle={{ width: 400, height: 400 }}
        type={TransferType.TABLE}
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
  .add('Grouped Tree Transfer (Single Selection)', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    return <div>
      <Transfer
        type={TransferType.GROUPED_TREE}
        listStyle={{ width: 250, height: 300 }}
        showSelectAll={false}
        dataSource={treeData}
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
  .add('Grouped Tree Transfer (Multiple Selection)', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    return <div>
      <Transfer
        type={TransferType.GROUPED_TREE}
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={treeData}
        render={(item) => item.name}
        operations={['Add', 'Remove']}
        titles={['Available Items', 'Selected Items']}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
        selectedKeys={selectedKeys}
        onSelectChange={(source, target) => setSelectedKeys([...source, ...target])}
      />
    </div>
  })
  .add('Grouped Tree Transfer (Selectable Group Titles)', () => {
    const [targetKeys, setTargetKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    return <div>
      <Transfer
        type={TransferType.GROUPED_TREE}
        listStyle={{ width: 250, height: 300 }}
        showSelectAll={false}
        dataSource={treeData}
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
    </div>
  })

export {}
