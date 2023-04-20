import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'


import {  Tabs } from '@acx-ui/components'

import * as UI                                                                           from './styledComponents'
import { UpdateConfirms }                                                                from './UpdateConfirms'
import { ChangedAPPTable, MergedAPPTable, NewAPPTable, RemovedAPPTable, UpdateAPPTable } from './UpdateTables'


const ApplicationPolicyMgmt = ()=>{
  const { $t } = useIntl()
  const updateAvailable = true
  const showCurrentInfo = ()=>{
    return (
      <UI.BannerVersion>
        <Space split={<Divider type='vertical' style={{ height: '80px' }} />}>
          {!updateAvailable&&<UI.FwContainer>
            <UI.LatestVersion>
              {$t({ defaultMessage: 'Latest Application Version:' })}
            </UI.LatestVersion>
            <UI.CheckMarkIcon/>
            {$t({ defaultMessage: 'Now is the latest version' })}
          </UI.FwContainer>}
          {updateAvailable&&<UI.FwContainer>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Latest Application Version:' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                v1.867.1
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabel>
                {$t({ defaultMessage: 'Support Regular:' })}
              </UI.CurrentLabel>
              <UI.CurrentValue>
                {$t({ defaultMessage: 'No' })}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <Space split={<Divider type='vertical' style={{ height: '15px' }} />}>
              <UI.CurrentValue style={{ fontWeight: 600 }}>
                {$t({ defaultMessage: 'Release' })}
              </UI.CurrentValue>
              <UI.CurrentValue>
                Apr 03, 2022
              </UI.CurrentValue>
            </Space>
          </UI.FwContainer>}
          <UI.FwContainer style={{ backgroundColor: 'var(--acx-primary-white)' }}>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Current Version:' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                {$t({ defaultMessage: 'RuckusSigPack-v2-1.6' })}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabel>
                {$t({ defaultMessage: 'Support Regular:' })}
              </UI.CurrentLabel>
              <UI.CurrentValue>
                {$t({ defaultMessage: 'No' })}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabel>
                {$t({ defaultMessage: 'Last Updated:' })}
              </UI.CurrentLabel>
              <UI.CurrentValue>
                {$t({ defaultMessage: 'Oct 16, 2020' })}
              </UI.CurrentValue>
            </UI.CurrentDetail>
          </UI.FwContainer>
        </Space>
        {updateAvailable&&<div style={{ marginTop: 5 }}>
          {$t({ defaultMessage: 'Clicking "Update" will proceed with '+
            'the below update details under this tenant' })}
        </div>}
        {updateAvailable&&<div style={{ marginTop: 10 }}>
          <UpdateConfirms/>
        </div>}
      </UI.BannerVersion>
    )
  }
  const updateDetails = ()=>{
    const tableActions = []
    tableActions.push({
      label: $t({ defaultMessage: 'Export All' })
    })
    tableActions.push({
      label: $t({ defaultMessage: 'Export Current List' })
    })
    const tabs = {
      newApplication: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'New Application ({totalNew})' },{ totalNew: 5 })}
        </UI.TabSpan>,
        content: <NewAPPTable actions={tableActions}/>,
        visible: true
      },
      categoryUpdate: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Category Update ({totalUpdate})' },
          { totalUpdate: 4 })}
        </UI.TabSpan>,
        content: <UpdateAPPTable actions={tableActions}/>,
        visible: true
      },
      appMerged: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Merged ({totalMerged})' },
          { totalMerged: 3 })}
        </UI.TabSpan>,
        content: <MergedAPPTable actions={tableActions}/>,
        visible: true
      },
      appRemoved: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Removed ({totalRemoved})' },
          { totalRemoved: 2 })}
        </UI.TabSpan>,
        content: <RemovedAPPTable actions={tableActions}/>,
        visible: true
      },
      appChanged: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Name Changed ({totalChanged})' },
          { totalChanged: 1 })}
        </UI.TabSpan>,
        content: <ChangedAPPTable actions={tableActions}/>,
        visible: true
      }
    }
    return <>
      <div style={{ fontWeight: 600, marginTop: 40 }}>
        {$t({ defaultMessage: 'Update Details' })}
      </div>
      <div>
        <Tabs
          defaultActiveKey='newApplication'
          type='card'
        >
          {
            Object.entries(tabs).map((item) =>
              item[1].visible &&
              <Tabs.TabPane
                key={item[0]}
                tab={item[1].title}
                children={item[1].content}
              />)
          }
        </Tabs>
      </div>
    </>
  }
  return <>
    {showCurrentInfo()}
    {updateAvailable&&updateDetails()}
  </>
}
export default ApplicationPolicyMgmt
