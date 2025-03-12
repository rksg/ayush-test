import { useState } from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card, Tabs }                 from '@acx-ui/components'
import { LicenseCalculatorCardProps } from '@acx-ui/msp/utils'
import { useGetTenantDetailsQuery }   from '@acx-ui/rc/services'

import * as UI from '../styledComponents'

import MaxLicenses from './MaxLicenses'
import MaxPeriod   from './MaxPeriod'

export default function LicenseCalculatorCard (props: LicenseCalculatorCardProps) {
  const { $t } = useIntl()
  const { title, subTitle, footerContent } = props
  const [currentTab, setCurrentTab] = useState<string | undefined>('maxLicenses')

  const { data: tenantDetailsData } = useGetTenantDetailsQuery({ })

  function onTabChange (tab: string) {
    setCurrentTab(tab)
  }

  const tabs = {
    maxLicenses: {
      title: $t({ defaultMessage: 'Max Licenses' }),
      content: <MaxLicenses showExtendedTrial={tenantDetailsData?.extendedTrial || false}/>,
      visible: true
    },
    maxPeriod: {
      title: $t({ defaultMessage: 'Max Period' }),
      content: <MaxPeriod showExtendedTrial={tenantDetailsData?.extendedTrial || false}/>,
      visible: true
    }
  }

  return <Col style={{ width: '356px', paddingLeft: 0, marginTop: '15px' }}>
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        height: '100%'
      }}>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginBottom: '10px' }}>
            <div style={{ flexDirection: 'column', marginTop: '4px' }}>
              <UI.Title>{ title }</UI.Title>
              {subTitle && <UI.SubTitle>{ subTitle }</UI.SubTitle>}
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
        { footerContent }
      </div>
    </Card>
  </Col>
}