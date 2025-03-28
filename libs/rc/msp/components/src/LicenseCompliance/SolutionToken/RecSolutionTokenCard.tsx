import { useState } from 'react'

import { Col, Form } from 'antd'
import { useIntl }   from 'react-intl'

import { Button, Card, Drawer, Tabs } from '@acx-ui/components'
import { LicenseCardProps }           from '@acx-ui/msp/utils'
import { useUserProfileContext }      from '@acx-ui/user'

import * as UI from '../styledComponents'

import SolutionTokenRecTabContent      from './SolutionTokenRecTabContent'
import SolutionTokenSettingsForm       from './SolutionTokenSettingsForm'
import SolutionTokenSettingsTabContent from './SolutionTokenSettingsTabContent'

export default function RecSolutionTokenCard (props: LicenseCardProps) {
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<string | undefined>('summary')
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false)
  const { title, data, trialType } = props

  const {
    isPrimeAdmin
  } = useUserProfileContext()

  const isPrimeAdminUser = isPrimeAdmin()

  const [form] = Form.useForm()

  function onTabChange (tab: string) {
    setCurrentTab(tab)
  }

  const openSolutionTokenSettings = function () {
    if(!openSettingsDrawer)
      setOpenSettingsDrawer(true)
  }

  function closeSolutionTokenSettings () {
    if(openSettingsDrawer)
      setOpenSettingsDrawer(false)
  }

  const tabs = {
    summary: {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SolutionTokenRecTabContent
        data={data}
        trialType={trialType}
        myAccountTabSelected={false}
        summaryTabSelected={true}/>,
      visible: true
    },
    myAccount: {
      title: $t({ defaultMessage: 'My Account' }),
      content: <SolutionTokenRecTabContent
        data={data}
        trialType={trialType}
        myAccountTabSelected={true}
        summaryTabSelected={false}/>,
      visible: true
    },
    settings: {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SolutionTokenSettingsTabContent
        isTabSelected={currentTab === 'settings'}/>,
      visible: true
    }
  }

  const onSubmitHandler = () => {
    form.submit()
  }

  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setOpenSettingsDrawer(false)
    form.resetFields()
  }

  return <Col style={{ width: '395px', paddingLeft: 0, marginTop: '15px' }}>
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        height: '100%'
      }}>
        <div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ flexDirection: 'column', marginTop: '4px' }}>
              <div style={{ display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between' }}>
                <UI.Title>{ title }</UI.Title>
                { data.licenseGap >= 0
                  ? <UI.GreenTickIcon /> : <UI.RedTickIcon /> }
              </div>
              <Tabs onChange={onTabChange} activeKey={currentTab}>
                { Object.entries(tabs).map((item) =>
                  item[1].visible &&
                <Tabs.TabPane
                  key={item[0]}
                  tab={item[1].title}
                  children={item[1].content}
                />) }
              </Tabs>
            </div>
          </div>
        </div>
        { currentTab === 'settings' &&
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'end'
          }}>
            <Button
              size='small'
              type={'link'}
              onClick={openSolutionTokenSettings}>
              {$t({ defaultMessage: 'Edit Settings' })}
            </Button>
          </div>
        }
        {
          openSettingsDrawer && <Drawer
            title={$t({ defaultMessage: 'Edit Solution Usage Cap' })}
            visible={openSettingsDrawer}
            onClose={closeSolutionTokenSettings}
            destroyOnClose={true}
            width={610}
            footer={
              <div><Button
                type='primary'
                disabled={!isPrimeAdminUser}
                onClick={() => onSubmitHandler()}>
                {$t({ defaultMessage: 'Save' })}
              </Button>
              <Button type='default' onClick={closeDrawer}>
                {$t({ defaultMessage: 'Close' })}
              </Button></div>
            }
          >
            <SolutionTokenSettingsForm form={form}/>
          </Drawer>
        }
      </div>
    </Card>
  </Col>
}