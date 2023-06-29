import { SummaryCard } from '..'
import { Button }      from '../../Button'

const data = [
  {
    title: 'title1',
    content: 'content1',
    colSpan: 3
  },
  {
    title: 'title2',
    content: 'content2',
    colSpan: 3
  },
  {
    title: 'title3',
    content: 'content3',
    colSpan: 3
  },
  {
    title: 'title4',
    content: 'content4',
    colSpan: 14
  },
  {
    custom: <Button style={{ margin: 'auto' }} type='link'>Button</Button>,
    colSpan: 1
  }
]

export const CustomItem = () => (<SummaryCard data={data} />)