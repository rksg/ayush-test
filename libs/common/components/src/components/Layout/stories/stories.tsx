import { storiesOf }    from '@storybook/react'
import { Space, Badge } from 'antd'
import { HashRouter }   from 'react-router-dom'

import {
  WorldSolid,
  CaretDownSolid,
  AccountCircleSolid,
  NotificationSolid,
  QuestionMarkCircleSolid,
  SearchOutlined
} from '@acx-ui/icons'

import { Layout }                 from '..'
import { ReactComponent as Logo } from '../../../../../../main/assets/Logo.svg'
import { Card }                   from '../../Card'
import { Dropdown }               from '../../Dropdown'
import { regionMenu, helpMenu }   from '../../Dropdown/stories'
import { LayoutUI }               from '../styledComponents'

import menuConfig from './menuConfig'

storiesOf('Layout', module).add('Basic', () => (
  // fix for storybook only
  <div style={{ margin: '-16px' }}>
    <HashRouter>
      <Layout
        logo={<Logo />}
        menuConfig={menuConfig}
        leftHeaderContent={
          <Dropdown overlay={regionMenu}>{(selectedKeys) =>
            <LayoutUI.DropdownText>
              <LayoutUI.Icon children={<WorldSolid />} />
              {selectedKeys}
              <LayoutUI.DropdownCaretIcon children={<CaretDownSolid />} />
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
    </HashRouter>
  </div>
))
