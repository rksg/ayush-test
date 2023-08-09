import React from 'react'

import { storiesOf }   from '@storybook/react'
import { Menu, Space } from 'antd'
import styled          from 'styled-components/macro'

import { WorldSolid, QuestionMarkCircleSolid, ConfigurationOutlined, CaretDownSolid } from '@acx-ui/icons'

import { Button }   from '../Button'
import { LayoutUI } from '../Layout/styledComponents'

import { CaretDownSolidIcon } from './styledComponents'

import { Dropdown } from '.'

const FakeLink = (props: React.PropsWithChildren) =>
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  <a href='#' onClick={(e) => e.preventDefault()}>{props.children}</a>
const Icon = styled(LayoutUI.Icon)`
  svg path { stroke: var(--acx-primary-black); }
`

export const regionMenu = <Menu
  selectable
  defaultSelectedKeys={['EU']}
  // eslint-disable-next-line no-console
  onClick={(event) => console.log(event)}
  items={[
    { key: 'US', label: <FakeLink>US</FakeLink> },
    { key: 'EU', label: <FakeLink>EU</FakeLink> },
    { key: 'Asia', label: <FakeLink>Asia</FakeLink> }
  ]}
/>

export const helpMenu = <Menu
  items={[
    { key: 'doc-center', label: <FakeLink>Documentation Center</FakeLink> },
    { key: 'how-to-videos', label: <FakeLink>How-To Videos</FakeLink> },
    { type: 'divider' },
    { key: 'open-cases', label: <FakeLink>My Open Cases</FakeLink> },
    { type: 'divider' },
    { key: 'about', label: <FakeLink>About RUCKUS ACX</FakeLink> }
  ]}
/>

storiesOf('Dropdown', module)
  .add('Header Selectable', () => {
    return <Dropdown overlay={regionMenu}>{(selectedKeys) =>
      <LayoutUI.DropdownText>
        <Icon children={<WorldSolid />} />
        {selectedKeys}
        <LayoutUI.Icon children={<CaretDownSolid />}/>
      </LayoutUI.DropdownText>
    }</Dropdown>
  })
  .add('Header Icon', () => {
    return <Dropdown overlay={helpMenu}>{() =>
      <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
    }</Dropdown>
  })
  .add('Button', () => {
    return <>
      <p>
        <Dropdown overlay={helpMenu}>{() =>
          <Button icon={<ConfigurationOutlined />} />
        }</Dropdown>
      </p>
      <p>
        <Dropdown overlay={helpMenu}>{() =>
          <Button>Open Dropdown</Button>
        }</Dropdown>
      </p>
      <p>
        <Dropdown overlay={helpMenu}>{() =>
          <Button>
            <Space>
              More Actions
              <CaretDownSolidIcon />
            </Space>
          </Button>
        }</Dropdown>
      </p>
    </>
  })
  .add('Custom Overlay', () => {
    return <Dropdown
      overlay={
        <Dropdown.OverlayContainer>
          <Dropdown.OverlayTitle>Custom Title</Dropdown.OverlayTitle>
          Custom content here
        </Dropdown.OverlayContainer>
      }
    >{() => <Button>Open Overlay</Button>}</Dropdown>
  })
