import { useEffect, useState } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'


import {  Tabs }                                                                     from '@acx-ui/components'
import { useExportAllSigPackMutation, useExportSigPackMutation, useGetSigPackQuery } from '@acx-ui/rc/services'
import { ApplicationInfo }                                                           from '@acx-ui/rc/utils'

import * as UI                                                                           from './styledComponents'
import { UpdateConfirms }                                                                from './UpdateConfirms'
import { ChangedAPPTable, MergedAPPTable, NewAPPTable, RemovedAPPTable, UpdateAPPTable } from './UpdateTables'

const ApplicationPolicyMgmt = ()=>{
  const { $t } = useIntl()
  const [ exportAllSigPack ] = useExportAllSigPackMutation()
  const [ exportSigPack] = useExportSigPackMutation()
  const [type, setType] = useState('APPLICATION_ADDED')
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [added, setAdded] = useState([] as ApplicationInfo[])
  const [updated, setUpdated] = useState([] as ApplicationInfo[])
  const [merged, setMerged] = useState([] as ApplicationInfo[])
  const [removed, setRemoved] = useState([] as ApplicationInfo[])
  const [renamed, setRenamed] = useState([] as ApplicationInfo[])
  const { data } = useGetSigPackQuery({ params: { changesIncluded: 'true' } })
  useEffect(()=>{
    if(data&&data.changedApplication.length){
      setUpdateAvailable(true)
      setAdded(data.changedApplication.filter(item=>item.type === 'APPLICATION_ADDED'))
      setUpdated(data.changedApplication.filter(item=>item.type === 'APPLICATION_UPDATED'))
      setMerged(data.changedApplication.filter(item=>item.type === 'APPLICATION_MERGED'))
      setRemoved(data.changedApplication.filter(item=>item.type === 'APPLICATION_REMOVED'))
      setRenamed(data.changedApplication.filter(item=>item.type === 'APPLICATION_RENAMED'))
    }
  },[data])
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
        {updateAvailable&&<div style={{ marginTop: 10, color: 'var(--acx-neutrals-70)' }}>
          {$t({ defaultMessage: 'Clicking "Update" will proceed with '+
            'the below updates under this tenant' })}
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
      label: $t({ defaultMessage: 'Export All' }),
      onClick: ()=>{
        exportAllSigPack({}).unwrap().catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
      }
    })
    tableActions.push({
      label: $t({ defaultMessage: 'Export Current List' }),
      onClick: ()=>{
        exportSigPack({ params: { type } }).unwrap().catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
      }
    })
    const tabs = {
      APPLICATION_ADDED: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'New Application ({totalNew})' },
          { totalNew: added.length })}
        </UI.TabSpan>,
        content: <NewAPPTable actions={tableActions} data={added}/>,
        visible: true
      },
      CATEGORY_UPDATED: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Category Update ({totalUpdate})' },
          { totalUpdate: updated.length })}
        </UI.TabSpan>,
        content: <UpdateAPPTable actions={tableActions} data={updated}/>,
        visible: true
      },
      APPLICATION_MERGED: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Merged ({totalMerged})' },
          { totalMerged: merged.length })}
        </UI.TabSpan>,
        content: <MergedAPPTable actions={tableActions} data={merged}/>,
        visible: true
      },
      APPLICATION_REMOVED: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Removed ({totalRemoved})' },
          { totalRemoved: removed.length })}
        </UI.TabSpan>,
        content: <RemovedAPPTable actions={tableActions} data={removed}/>,
        visible: true
      },
      APPLICATION_RENAMED: {
        title: <UI.TabSpan>{$t({ defaultMessage: 'Application Name Changed ({totalChanged})' },
          { totalChanged: renamed.length })}
        </UI.TabSpan>,
        content: <ChangedAPPTable actions={tableActions} data={renamed}/>,
        visible: true
      }
    }
    return <>
      <div style={{ fontWeight: 600, marginTop: 20 }}>
        {$t({ defaultMessage: 'Update Details' })}
      </div>
      <div>
        <Tabs
          defaultActiveKey='APPLICATION_ADDED'
          type='third'
          onChange={(key)=>setType(key)}
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
