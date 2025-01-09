import { useState } from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card, Tabs }          from '@acx-ui/components'
import { MspLicenseCardProps } from '@acx-ui/msp/utils'
import { TrialType }           from '@acx-ui/rc/utils'

import * as UI    from './styledComponents'
import TabContent from './TabContent'

export default function MspDeviceNetworkingCard (props: MspLicenseCardProps) {
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<string | undefined>('mspSubscriptions')
  const { title, selfData, mspData, isExtendedTrial, footerContent } = props

  function onTabChange (tab: string) {
    setCurrentTab(tab)
  }

  const tabs = {
    mspSubscriptions: {
      title: $t({ defaultMessage: 'MSP Subscriptions' }),
      content: <TabContent
        data={mspData}
        isMsp={false}
        trialType={isExtendedTrial ? TrialType.EXTENDED_TRIAL : undefined}
      />,
      visible: true
    },
    myAccount: {
      title: $t({ defaultMessage: 'My Account' }),
      content: <TabContent
        data={selfData}
        isMsp={true}
        trialType={TrialType.TRIAL}
      />,
      visible: true
    }
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
      </div>
    </Card>
  </Col>
}