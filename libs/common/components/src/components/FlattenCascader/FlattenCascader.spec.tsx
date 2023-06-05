import { DefaultOptionType } from 'antd/lib/cascader'

import { render, screen } from '@acx-ui/test-utils'

import { FlattenCascader } from './FlattenCascader'

const item = (value: string, children?: DefaultOptionType[]) => ({
  label: `Item ${value}`,
  value: value,
  children
}) as DefaultOptionType

describe('FlattenCascader', () => {
  const options = [
    item('1', [item('1.1')]),
    item('2', [
      item('2.1'),
      item('2.2', [
        item('2.2.1'),
        item('2.2.2')
      ])
    ])
  ]
  it('renders cascader with items', async () => {
    render(<FlattenCascader options={options} />)

    expect(await screen.findByRole('menuitemcheckbox', { name: /Item 1/ })).toBeInTheDocument()
  })

  it('renders menu even when disabled', async () => {
    render(<FlattenCascader disabled options={options} />)

    expect(await screen.findByRole('menuitemcheckbox', { name: /Item 1/ })).toBeInTheDocument()
  })
})
