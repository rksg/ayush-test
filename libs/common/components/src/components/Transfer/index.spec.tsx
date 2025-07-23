import '@testing-library/jest-dom'
import React, { useState } from 'react'

import userEvent        from '@testing-library/user-event'
import { Tag }          from 'antd'
import { TransferItem } from 'antd/lib/transfer'
import { IntlProvider } from 'react-intl'

import { render, screen } from '@acx-ui/test-utils'

import { Transfer, TransferType } from '.'

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

describe('Transfer', () => {
  it('should render correctly', async () => {
    render(<IntlProvider locale='en'>
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
        titles={['Available APs', 'Selected APs']}
      />
    </IntlProvider>)

    expect(await screen.findByText('5 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()
  })

  it('should render table type correctly', async () => {
    const TestTransferComponent = () => {
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
        name: 'item5', key: 'item5', disabled: true
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

      return <IntlProvider locale='en'>
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
      </IntlProvider>
    }

    render(<TestTransferComponent />)

    expect(await screen.findByText('5 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()

    const item3 = await screen.findAllByText(/item3/)
    const item5 = await screen.findAllByText(/item5/)
    await userEvent.click(item3[0])
    await userEvent.click(item5[0])
    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))
    expect(await screen.findByText('4 available')).toBeVisible()
    expect(await screen.findByText('1 selected')).toBeVisible()
  })

  it('should render correct available counts with "excludeDisabledInCount"', async () => {
    render(<IntlProvider locale='en'>
      <Transfer
        excludeDisabledInCount
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        dataSource={[
          { name: 'item1', key: 'item1', disabled: true },
          { name: 'item2', key: 'item2', disabled: true },
          { name: 'item3', key: 'item3' },
          { name: 'item4', key: 'item4' },
          { name: 'item5', key: 'item5' }
        ]}
        render={item => item.name}
        operations={['Add', 'Remove']}
        titles={['Available APs', 'Selected APs']}
      />
    </IntlProvider>)

    expect(await screen.findByText('3 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()
  })

  it('should render correct selected counts with "excludeDisabledInCount"', async () => {
    render(<IntlProvider locale='en'>
      <Transfer
        excludeDisabledInCount
        listStyle={{ width: 250, height: 300 }}
        showSearch
        showSelectAll={false}
        targetKeys={['item1', 'item4', 'item5']}
        dataSource={[
          { name: 'item1', key: 'item1', disabled: true },
          { name: 'item2', key: 'item2', disabled: true },
          { name: 'item3', key: 'item3' },
          { name: 'item4', key: 'item4' },
          { name: 'item5', key: 'item5' }
        ]}
        render={item => item.name}
        operations={['Add', 'Remove']}
        titles={['Available APs', 'Selected APs']}
      />
    </IntlProvider>)

    expect(await screen.findByText('1 available')).toBeVisible()
    expect(await screen.findByText('2 selected')).toBeVisible()
  })

  it('should render grouped tree type with single selection correctly', async () => {
    const TestTransferComponent = () => {
      const [targetKeys, setTargetKeys] = useState<string[]>([])
      const [selectedKeys, setSelectedKeys] = useState<string[]>([])

      return <IntlProvider locale='en'>
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
      </IntlProvider>
    }

    render(<TestTransferComponent />)

    expect(await screen.findByText('9 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()

    const item3 = await screen.findAllByText(/Item 3/)
    const item5 = await screen.findAllByText(/Item 5/)
    await userEvent.click(item3[0])
    await userEvent.click(item5[0])
    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))
    expect(await screen.findByText('8 available')).toBeVisible()
    expect(await screen.findByText('1 selected')).toBeVisible()

  })

  it('should render grouped tree type with multiple selection correctly', async () => {
    const TestTransferComponent = () => {
      const [targetKeys, setTargetKeys] = useState<string[]>([])
      const [selectedKeys, setSelectedKeys] = useState<string[]>([])

      return <IntlProvider locale='en'>
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
        />
      </IntlProvider>
    }

    render(<TestTransferComponent />)

    expect(await screen.findByText('9 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()

    const item3 = await screen.findAllByText(/Item 3/)
    const item4 = await screen.findAllByText(/Item 4/)
    const item5 = await screen.findAllByText(/Item 5/)
    await userEvent.click(item3[0])
    await userEvent.click(item4[0])
    await userEvent.click(item5[0])
    await userEvent.click(item4[0])
    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))
    expect(await screen.findByText('7 available')).toBeVisible()
    expect(await screen.findByText('2 selected')).toBeVisible()

  })

  it('should render grouped tree type with selectable group titles correctly', async () => {
    const TestTransferComponent = () => {
      const [targetKeys, setTargetKeys] = useState<string[]>([])
      const [selectedKeys, setSelectedKeys] = useState<string[]>([])

      return <IntlProvider locale='en'>
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
      </IntlProvider>
    }

    render(<TestTransferComponent />)

    expect(await screen.findByText('9 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()

    const group1 = await screen.findByText(/Group 1/)
    const group2 = await screen.findByText(/Group 2/)
    await userEvent.click(group2)
    await userEvent.click(group1)
    await userEvent.click(group2)
    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))
    expect(await screen.findByText('4 available')).toBeVisible()
    expect(await screen.findByText('5 selected')).toBeVisible()
  })

})
