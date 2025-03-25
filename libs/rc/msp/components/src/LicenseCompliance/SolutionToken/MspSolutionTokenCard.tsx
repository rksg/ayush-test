import { useState } from 'react'

import { Col, Form } from 'antd'
import { useIntl }   from 'react-intl'

import { Button, Card, Drawer, Tabs } from '@acx-ui/components'
import { MspLicenseCardProps }        from '@acx-ui/msp/utils'
import { TrialType }                  from '@acx-ui/rc/utils'
import { useUserProfileContext }      from '@acx-ui/user'

import * as UI from '../styledComponents'

import SolutionTokenMspTabContent      from './SolutionTokenMspTabContent'
import SolutionTokenSettingsForm       from './SolutionTokenSettingsForm'
import SolutionTokenSettingsTabContent from './SolutionTokenSettingsTabContent'


export default function MSPSolutionTokenCard (props: MspLicenseCardProps) {
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<string | undefined>('mspSubscriptions')
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false)
  const { title, selfData, mspData, isExtendedTrial, footerContent } = props

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
    mspSubscriptions: {
      title: $t({ defaultMessage: 'MSP Subscriptions' }),
      content: <SolutionTokenMspTabContent
        myAccountTabSelected={false}
        data={mspData}
        isMsp={false}
        trialType={isExtendedTrial ? TrialType.EXTENDED_TRIAL : undefined}
      />,
      visible: true
    },
    myAccount: {
      title: $t({ defaultMessage: 'My Account' }),
      content: <SolutionTokenMspTabContent
        myAccountTabSelected={true}
        data={selfData}
        isMsp={true}
        trialType={TrialType.TRIAL}
      />,
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
                { currentTab === 'myAccount' ? selfData.licenseGap >= 0
                  ? <UI.GreenTickIcon /> : <UI.RedTickIcon />
                  : mspData.licenseGap >= 0
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
        { currentTab === 'mspSubscriptions' && footerContent }
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