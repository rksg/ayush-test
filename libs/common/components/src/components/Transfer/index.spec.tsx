import '@testing-library/jest-dom'
import React, { useState } from 'react'

import { Tag }          from 'antd'
import { TransferItem } from 'antd/lib/transfer'
import { IntlProvider } from 'react-intl'

import { render, screen } from '@acx-ui/test-utils'

import { Transfer } from '.'


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

      return <IntlProvider locale='en'>
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
      </IntlProvider>
    }

    render(<TestTransferComponent />)

    expect(await screen.findByText('5 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()
  })
})
