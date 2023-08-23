import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Transfer } from '.'

describe('Transfer', () => {
  it('should render correctly', async () => {
    render(<Transfer
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
    />)

    expect(await screen.findByText('5 available')).toBeVisible()
    expect(await screen.findByText('0 selected')).toBeVisible()
  })
})
