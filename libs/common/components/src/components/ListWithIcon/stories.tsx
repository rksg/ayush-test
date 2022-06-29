import {
  HomeOutlined,
  LoadingOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { storiesOf } from '@storybook/react'
import styled        from 'styled-components/macro'


import { ListWithIcon, ListWithIconProps } from '.'

export const StyledListWithIconLight = styled.div`
width: 300px;
border-radius: 4px;

.ant-list-pagination {
  margin-top: 24px;
  text-align: center;
}

.ant-list-item:hover {
  background-color: #D8D7C9;
}
`

export const StyledListWithIcon = styled.div`
width: 300px;
background-color: #333333;
border-radius: 4px;

.venueInfoHeader {
  color: white;
}

.ant-list-item {
    color: white;
}

.ant-list-split .ant-list-item {
  border-bottom: 1px solid #464749;
}

.ant-list-split .ant-list-header {
  border-bottom: 1px solid #464749;
}

.ant-list-split.ant-list-something-after-last-item 
.ant-spin-container > .ant-list-items > .ant-list-item:last-child {
  border-bottom: 1px solid #464749;
}

.ant-list-item:hover {
    background-color: #565758;
}

.ant-list-pagination {
    margin-top: 24px;
    text-align: center;
}

.ant-pagination-item a {
    display: block;
    padding: 0 6px;
    color: white;
    transition: none;
}
.ant-pagination-item-active a {
    color: #EC7100
}
.ant-pagination-prev button, .ant-pagination-next button {
    color: white;
    cursor: pointer;
    user-select: none;
}
`

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
  .add('Basic',() => <ListWithIcon data={data} />)
  .add('With header and footer',() => <ListWithIcon data={data} header={header} footer={footer} />)
  .add('With pagination',() => <ListWithIcon data={data} isPaginate={true} pageSize={4} />)
  .add('With Dark Styles',() => (<StyledListWithIcon>
    <ListWithIcon data={data} isPaginate={true} pageSize={4} />
  </StyledListWithIcon>))
  .add('With Light Styles',() => (<StyledListWithIconLight>
    <ListWithIcon data={data} isPaginate={true} pageSize={4} />
  </StyledListWithIconLight>))
  .add('Empty Data',() => <ListWithIcon data={[]} />)