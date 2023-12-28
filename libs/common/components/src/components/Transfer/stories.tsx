import { useState } from 'react'

import { storiesOf } from '@storybook/react'

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

export {}
