import { useState } from 'react'

import { Divider, Space }                            from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'


import {  Loader, Tabs }                                         from '@acx-ui/components'
import { DateFormatEnum, formatter }                             from '@acx-ui/formatter'
import { useExportAllSigPackMutation, useExportSigPackMutation } from '@acx-ui/rc/services'
import { ApplicationUpdateType }                                 from '@acx-ui/rc/utils'

import * as UI                                                                           from './styledComponents'
import { UpdateConfirms }                                                                from './UpdateConfirms'
import { ChangedAPPTable, MergedAPPTable, NewAPPTable, RemovedAPPTable, UpdateAPPTable } from './UpdateTables'
import { useSigPackDetails }                                                             from './useSigPackDetails'

export const changedApplicationTypeTextMap: Record<ApplicationUpdateType, MessageDescriptor> = {
  [ApplicationUpdateType.APPLICATION_ADDED]: defineMessage({ defaultMessage: 'New Application' }),
  // eslint-disable-next-line max-len
  [ApplicationUpdateType.APPLICATION_MERGED]: defineMessage({ defaultMessage: 'Application Merged' }),
  // eslint-disable-next-line max-len
  [ApplicationUpdateType.APPLICATION_REMOVED]: defineMessage({ defaultMessage: 'Application Removed' }),
  // eslint-disable-next-line max-len
  [ApplicationUpdateType.APPLICATION_RENAMED]: defineMessage({ defaultMessage: 'Application Name Changed' }),
  [ApplicationUpdateType.CATEGORY_UPDATED]: defineMessage({ defaultMessage: 'Category Updated' })
}

const ApplicationPolicyMgmt = () => {
  const { $t } = useIntl()
  const [ exportAllSigPack ] = useExportAllSigPackMutation()
  const [ exportSigPack ] = useExportSigPackMutation()
  const [ type, setType ] = useState(ApplicationUpdateType.APPLICATION_ADDED)
  const {
    data,
    changedAppsInfoMap,
    updateAvailable,
    confirmationType,
    isFetching,
    isLoading
  } = useSigPackDetails()

  const showCurrentInfo = () => {
    return (
      <div>
        <Space split={<Divider type='vertical' style={{ height: '80px' }} />}>
          {!updateAvailable && <UI.FwContainer>
            <UI.LatestVersion>
              {$t({ defaultMessage: 'Latest Application Version:' })}
            </UI.LatestVersion>
            <UI.CheckMarkIcon/>
            {$t({ defaultMessage: 'Now is the latest version' })}
          </UI.FwContainer>}
          {updateAvailable && <UI.FwContainer>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Latest Application Version:' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                {data?.latestVersion}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Release' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                {formatter(DateFormatEnum.DateFormat)(data?.latestReleasedDate)}
              </UI.CurrentValue>
            </UI.CurrentDetail>
          </UI.FwContainer>}
          <UI.FwContainer style={{ backgroundColor: 'var(--acx-primary-white)' }}>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Current Version:' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                {'RuckusSigPack-'+data?.currentVersion}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabelBold>
                {$t({ defaultMessage: 'Release' })}
              </UI.CurrentLabelBold>
              <UI.CurrentValue>
                {formatter(DateFormatEnum.DateFormat)(data?.currentReleasedDate)}
              </UI.CurrentValue>
            </UI.CurrentDetail>
            <UI.CurrentDetail>
              <UI.CurrentLabel>
                {$t({ defaultMessage: 'Last Updated:' })}
              </UI.CurrentLabel>
              <UI.CurrentValue>
                {formatter(DateFormatEnum.DateFormat)(data?.currentUpdatedDate)}
              </UI.CurrentValue>
            </UI.CurrentDetail>
          </UI.FwContainer>
        </Space>
        {updateAvailable && <>
          <div style={{ marginTop: 10, color: 'var(--acx-neutrals-70)' }}>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Clicking "Update" will proceed with the below updates under this tenant' })}
          </div>
          <div style={{ marginTop: 10 }}>
            <UpdateConfirms
              changedAppsInfoMap={changedAppsInfoMap}
              confirmationType={confirmationType}
            />
          </div>
        </>}
      </div>
    )
  }
  const updateDetails = () => {
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

    const added = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_ADDED]?.data ?? []
    const updated = changedAppsInfoMap[ApplicationUpdateType.CATEGORY_UPDATED]?.data ?? []
    const merged = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_MERGED]?.data ?? []
    const removed = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_REMOVED]?.data ?? []
    const renamed = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_RENAMED]?.data ?? []

    const tabs = {
      APPLICATION_ADDED: {
        title: <UI.TabSpan>
          {$t(changedApplicationTypeTextMap[ApplicationUpdateType.APPLICATION_ADDED])}
          {' (' + added.length + ')'}
        </UI.TabSpan>,
        content: <NewAPPTable actions={tableActions} data={added}/>,
        visible: true
      },
      CATEGORY_UPDATED: {
        title: <UI.TabSpan>
          {$t(changedApplicationTypeTextMap[ApplicationUpdateType.CATEGORY_UPDATED])}
          {' (' + updated.length + ')'}
        </UI.TabSpan>,
        content: <UpdateAPPTable actions={tableActions} data={updated}/>,
        visible: true
      },
      APPLICATION_MERGED: {
        title: <UI.TabSpan>
          {$t(changedApplicationTypeTextMap[ApplicationUpdateType.APPLICATION_MERGED])}
          {' (' + merged.length + ')'}
        </UI.TabSpan>,
        content: <MergedAPPTable actions={tableActions} data={merged}/>,
        visible: true
      },
      APPLICATION_REMOVED: {
        title: <UI.TabSpan>
          {$t(changedApplicationTypeTextMap[ApplicationUpdateType.APPLICATION_REMOVED])}
          {' (' + removed.length + ')'}
        </UI.TabSpan>,
        content: <RemovedAPPTable actions={tableActions} data={removed}/>,
        visible: true
      },
      APPLICATION_RENAMED: {
        title: <UI.TabSpan>
          {$t(changedApplicationTypeTextMap[ApplicationUpdateType.APPLICATION_RENAMED])}
          {' (' + renamed.length + ')'}
        </UI.TabSpan>,
        content: <ChangedAPPTable actions={tableActions} data={renamed}/>,
        visible: true
      }
    }
    return <>
      <UI.CurrentLabelBold style={{ marginTop: 20 }}>
        {$t({ defaultMessage: 'Update Details' })}
      </UI.CurrentLabelBold>
      <div>
        <Tabs
          defaultActiveKey='APPLICATION_ADDED'
          type='third'
          onChange={(key)=>setType(key as ApplicationUpdateType)}
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
  return <Loader states={[{ isLoading: isLoading || isFetching }]}>
    {showCurrentInfo()}
    {updateAvailable && updateDetails()}
  </Loader>
}
export default ApplicationPolicyMgmt
