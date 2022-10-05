import React from 'react'

import { storiesOf } from '@storybook/react'
import { Menu }      from 'antd'
import styled        from 'styled-components/macro'

import { WorldSolid, ArrowExpand, QuestionMarkCircleSolid } from '@acx-ui/icons'

import { LayoutUI } from '../Layout/styledComponents'

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
  .add('Selectable', () => {
    return <Dropdown overlay={regionMenu}>{(selectedKeys) =>
      <LayoutUI.DropdownText>
        <Icon children={<WorldSolid />} />
        {selectedKeys}
        <Icon children={<ArrowExpand />} />
      </LayoutUI.DropdownText>
    }</Dropdown>
  })
  .add('Icon', () => {
    return <Dropdown overlay={helpMenu}>{() =>
      <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
    }</Dropdown>
  })
