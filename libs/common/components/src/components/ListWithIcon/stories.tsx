import {
  HomeOutlined,
  LoadingOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { storiesOf } from '@storybook/react'

import { ListWithIcon, ListWithIconProps } from '.'

const data:ListWithIconProps['data'] = [
  {
    icon: <HomeOutlined/>,
    title: 'Lorem ipsum dolor sit amet',
    popoverContent: <h3>Test popover.</h3>
  },
  {
    icon: <LoadingOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SettingFilled/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SmileOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SyncOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <HomeOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <LoadingOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SettingFilled/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SmileOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  },
  {
    icon: <SyncOutlined/>,
    title: 'Lorem ipsum dolor sit amet'
  }
]

const header = <div style={{ fontWeight: 'bold' }}>Header</div>
const footer = <div style={{ fontWeight: 'bold' }}>Footer</div>

storiesOf('List with Icon', module)
  .add('Basic',() => <ListWithIcon data={data} showPopoverTitle={true} />)
  .add('With header and footer',() => <ListWithIcon data={data} header={header} footer={footer} />)
  .add('With pagination',() => <ListWithIcon data={data} isPaginate={true} pageSize={4} />)
  .add('Empty Data',() => <ListWithIcon data={[]} />)