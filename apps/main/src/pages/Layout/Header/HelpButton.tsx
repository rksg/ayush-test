import { useState } from 'react'

import { Typography, Input, Divider } from 'antd'
import { useIntl }                    from 'react-intl'

import { LayoutUI, GridRow, GridCol, Button }      from '@acx-ui/components'
import { QuestionMarkCircleSolid, SearchOutlined } from '@acx-ui/icons'

import About    from './About'
import Firewall from './Firewall'
import {
  RowWrapper,
  StyledPopover,
  Description,
  MenuLink,
  MenuRowContainer,
  LinkItem,
  SearchRow,
  LinkCol,
  MenuIcon } from './styledComponents'




export default function HelpHeaderButton () {
  const { $t } = useIntl()

  const [aboutModalState, setAboutModalOpen] = useState(false)
  const [firewallModalState, setFirewallModalOpen] = useState(false)


  const content = (<div style={{ width: 500, paddingBottom: 20 }}>
    <GridRow style={{ padding: 25 }}>
      <GridCol col={{ span: 24 }}>
        <Typography.Title level={3}>
          {$t({ defaultMessage: 'Hellp & Support' })}
        </Typography.Title>
      </GridCol>
    </GridRow>
    <RowWrapper>
      <SearchRow>
        <SearchOutlined/>
        <Input
          style={{ width: '90%' }}
          placeholder={$t(({ defaultMessage: 'Search...' }))}
          bordered={false}
        />
      </SearchRow>
    </RowWrapper>
    <MenuRowContainer>
      <GridCol col={{ span: 24 }} style={{ paddingLeft: 0 }}>
        <Typography.Title level={4} style={{ fontWeight: 600, marginBottom: 0 }}>
          {$t({ defaultMessage: 'Help For This Page' })}
        </Typography.Title>
        <Description>{$t({ defaultMessage: 'Contextual Help specific to this page' })}</Description>
      </GridCol>
      <Divider style={{ margin: 0 }}/>
    </MenuRowContainer>
    <MenuRowContainer>
      <GridCol col={{ span: 24 }}>
        <Typography.Title level={4} style={{ fontWeight: 600, marginBottom: 0 }}>
          {$t({ defaultMessage: 'Get Started Tour' })}
        </Typography.Title>
        <Description>{$t({ defaultMessage: 'Walk through the key functionalities' })}</Description>
      </GridCol>
      <Divider style={{ margin: 0 }}/>
    </MenuRowContainer>
    <MenuRowContainer>
      <GridCol col={{ span: 24 }}>
        <Typography.Title level={4} style={{ fontWeight: 600, marginBottom: 0 }}>
          {$t({ defaultMessage: 'Contact Support' })}
        </Typography.Title>
        <Description>{$t({ defaultMessage: 'We are here to help you' })}</Description>
      </GridCol>
      <Divider style={{ margin: 0 }}/>
    </MenuRowContainer>


    <LinkItem paddingTop={'25'}>
      <GridCol col={{ span: 5 }} >
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'How to Videos' })}</MenuLink>
        </Button>
      </GridCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Dictionary' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Documentation' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>

    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Knowledge Articles' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Forums' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <Divider style={{ margin: 0 }}/>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'My Open Case' })}</MenuLink>
        </Button>
      </LinkCol>
      <Divider style={{ margin: 0 }}/>
    </LinkItem>
    <LinkItem>
      <Divider style={{ margin: 0 }}/>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Privacy' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'New Features' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link' onClick={() => { setAboutModalOpen(true) }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'About RUCKUS One' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
    <LinkItem>
      <LinkCol>
        <Button type='link'
          onClick={() => {
            setFirewallModalOpen(true)
          }}>
          <MenuIcon/>
          <MenuLink>{$t({ defaultMessage: 'Firewall ACL Inputs' })}</MenuLink>
        </Button>
      </LinkCol>
    </LinkItem>
  </div>
  )

  const HelpHeaderButton = () => {
    return <>
      <StyledPopover placement='topRight' content={content} trigger='click'>
        <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
      </StyledPopover>
      <About modalState={aboutModalState} setIsModalOpen={setAboutModalOpen}/>
      <Firewall modalState={firewallModalState} setIsModalOpen={setFirewallModalOpen}/>
    </>
  }

  return <HelpHeaderButton />
}
