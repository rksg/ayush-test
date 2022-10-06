import { storiesOf }     from '@storybook/react'
import { Space, Badge }  from 'antd'
import { BrowserRouter } from 'react-router-dom'

import {
  WorldSolid,
  ArrowExpand,
  AccountCircleSolid,
  NotificationSolid,
  QuestionMarkCircleSolid,
  SearchOutlined
} from '@acx-ui/icons'

import { Layout }               from '..'
import { Card }                 from '../../Card'
import { Dropdown }             from '../../Dropdown'
import { regionMenu, helpMenu } from '../../Dropdown/stories'
import { LayoutUI }             from '../styledComponents'

import menuConfig from './menuConfig'

storiesOf('Layout', module).add('Basic', () => (
  // fix for storybook only
  <div style={{ margin: '-16px' }}>
    <BrowserRouter>
      <Layout
        menuConfig={menuConfig}
        leftHeaderContent={
          <Dropdown overlay={regionMenu}>{(selectedKeys) =>
            <LayoutUI.DropdownText>
              <LayoutUI.Icon children={<WorldSolid />} />
              {selectedKeys}
              <LayoutUI.Icon children={<ArrowExpand />} />
            </LayoutUI.DropdownText>
          }</Dropdown>
        }
        rightHeaderContent={<>
          Antelope Valley Union High School District
          <LayoutUI.ButtonOutlined shape='circle' icon={<SearchOutlined />} />
          <LayoutUI.Divider />
          <Badge count={7} overflowCount={9} offset={[-3, 0]}>
            <LayoutUI.ButtonSolid icon={<NotificationSolid />} />
          </Badge>
          <Dropdown overlay={helpMenu}>{() =>
            <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
          }</Dropdown>
          <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
        </>}
        content={
          <Space direction='vertical' style={{ width: '100%' }}>
            <Card>Full width content</Card>
            <div>{ new Array(100).fill(0).map((_, i) => <p key={i}>More content</p>) }</div>
          </Space>
        }
      />
    </BrowserRouter>
  </div>
))
