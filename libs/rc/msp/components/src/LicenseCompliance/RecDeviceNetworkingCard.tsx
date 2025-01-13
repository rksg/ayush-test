import { useState } from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card, Tabs }       from '@acx-ui/components'
import { LicenseCardProps } from '@acx-ui/msp/utils'

import RecTabContent from './RecTabContent'
import * as UI       from './styledComponents'

export default function RecDeviceNetworkingCard (props: LicenseCardProps) {
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<string | undefined>('summary')
  const { title, data, trialType } = props

  function onTabChange (tab: string) {
    setCurrentTab(tab)
  }

  const tabs = {
    summary: {
      title: $t({ defaultMessage: 'Summary' }),
      content: <RecTabContent
        data={data}
        trialType={trialType}
        myAccountTabSelected={false}
        summaryTabSelected={true}/>,
      visible: true
    },
    myAccount: {
      title: $t({ defaultMessage: 'My Account' }),
      content: <RecTabContent
        data={data}
        trialType={trialType}
        myAccountTabSelected={true}
        summaryTabSelected={false}/>,
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
      </div>
    </Card>
  </Col>
}