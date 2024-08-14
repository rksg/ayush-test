import React, { MutableRefObject } from 'react'

import { storiesOf }                    from '@storybook/react'
import { DatePickerProps, Menu, Space } from 'antd'
import { RangePickerProps }             from 'antd/lib/date-picker'
import dayjs                            from 'dayjs'
import moment                           from 'moment-timezone'
import styled                           from 'styled-components/macro'

import { WorldSolid, QuestionMarkCircleSolid, ConfigurationOutlined, CaretDownSolid } from '@acx-ui/icons'

import { Button }   from '../Button'
import { LayoutUI } from '../Layout/styledComponents'

import { CaretDownSolidIcon } from './styledComponents'

import { DateTimeDropdown, Dropdown } from '.'



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

  .add('DateTimeDropdown - No disabled dates', () => {
    const mockDate = moment('2024-08-12T10:30:00')
    const testOnChange: DatePickerProps['onChange'] = () => {}
    const mockTime : MutableRefObject<number> = { current: 5.5 }
    return (<DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={mockDate}
      time={mockTime}
      onchange={testOnChange}
    />)
  })

  .add('DateTimeDropdown - Have disabled dates', () => {
    const mockDate = moment('2024-08-12T10:30:00')
    const testOnChange: DatePickerProps['onChange'] = () => {}
    const mockTime : MutableRefObject<number> = { current: 5.5 }
    const testDisabledDate : RangePickerProps['disabledDate']= (current) => {
      return current && current < dayjs().startOf('day')
    }
    return (<DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={mockDate}
      disabledDate={testDisabledDate}
      time={mockTime}
      onchange={testOnChange}
    />)
  })