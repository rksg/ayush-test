/* eslint-disable max-len */
import {  useContext, useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'


import { Alert, Loader, Collapse, AnchorContext }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import {
  useGetAaaSettingQuery, useGetVenueTemplateSwitchAAAServerListQuery,
  useGetVenueTemplateSwitchAaaSettingQuery, useVenueSwitchAAAServerListQuery
} from '@acx-ui/rc/services'
import { useTableQuery, AAAServerTypeEnum, useConfigTemplateQueryFnSwitcher, AAASetting, useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }                                                                                         from '@acx-ui/react-router-dom'

import { AAAServerTable }  from './AAAServerTable'
import { AAANotification } from './contentsMap'
import * as UI             from './styledComponents'

const { Panel } = Collapse

const PanelHeader = {
  [AAAServerTypeEnum.RADIUS]: defineMessage({ defaultMessage: 'RADIUS Servers ({count})' }),
  [AAAServerTypeEnum.TACACS]: defineMessage({ defaultMessage: 'TACACS+ Servers ({count})' }),
  [AAAServerTypeEnum.LOCAL_USER]: defineMessage({ defaultMessage: 'Local Users ({count})' })
}

export function AAAServers (props: {
  cliApplied?: boolean
}) {
  const { venueId } = useParams()
  const { $t } = useIntl()
  const { setReadyToScroll } = useContext(AnchorContext)
  const { isTemplate } = useConfigTemplate()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isSwitchRbacEnabled
  const getPanelHeader = (type: AAAServerTypeEnum, count: number) => {
    return $t(PanelHeader[type] , { count })
  }

  const defaultPayload = {
    venueId,
    serverType: AAAServerTypeEnum.RADIUS,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const payloadMap = {
    [AAAServerTypeEnum.RADIUS]: { ...defaultPayload },
    [AAAServerTypeEnum.TACACS]: { ...defaultPayload, serverType: AAAServerTypeEnum.TACACS },
    [AAAServerTypeEnum.LOCAL_USER]: { ...defaultPayload, serverType: AAAServerTypeEnum.LOCAL_USER }
  }

  const { data: aaaSetting } = useConfigTemplateQueryFnSwitcher<AAASetting>({
    useQueryFn: useGetAaaSettingQuery,
    useTemplateQueryFn: useGetVenueTemplateSwitchAaaSettingQuery,
    enableRbac: isSwitchRbacEnabled
  })

  const radiusTableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueTemplateSwitchAAAServerListQuery : useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.RADIUS],
    pagination: {
      pageSize: 5
    },
    enableRbac: resolvedRbacEnabled
  })

  const tacasTableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueTemplateSwitchAAAServerListQuery : useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.TACACS],
    pagination: {
      pageSize: 5
    },
    enableRbac: resolvedRbacEnabled
  })

  const localUserTableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueTemplateSwitchAAAServerListQuery : useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.LOCAL_USER],
    pagination: {
      pageSize: 5
    },
    enableRbac: resolvedRbacEnabled
  })

  const [aaaServerCount, setAaaServerCount] = useState({
    localUserTotalCount: 0,
    tacasTotalCount: 0,
    radiusTotalCount: 0
  })

  useEffect(() => {
    if (localUserTableQuery.data &&
      tacasTableQuery.data &&
      radiusTableQuery.data) {
      setAaaServerCount({
        localUserTotalCount: localUserTableQuery.data.totalCount,
        tacasTotalCount: tacasTableQuery.data.totalCount,
        radiusTotalCount: radiusTableQuery.data.totalCount
      })

      setReadyToScroll?.(r => [...(new Set(r.concat('Servers-&-Users')))])
    }
  }, [localUserTableQuery.data, tacasTableQuery.data, radiusTableQuery.data, setReadyToScroll])

  return (
    <Loader states={[
      {
        isLoading: radiusTableQuery.isLoading ||
        tacasTableQuery.isLoading ||
        localUserTableQuery.isLoading
      }]}
    >
      <UI.AAAServers>
        {
          radiusTableQuery?.data?.totalCount === 0 && tacasTableQuery?.data?.totalCount === 0 &&
        <Alert message={$t(AAANotification)} type='info' showIcon />
        }
        <Collapse
          defaultActiveKey={['1', '2', '3']}
          ghost={true}
        >
          <Panel header={getPanelHeader(AAAServerTypeEnum.RADIUS, aaaServerCount.radiusTotalCount)} key='1' >
            <AAAServerTable
              type={AAAServerTypeEnum.RADIUS}
              tableQuery={radiusTableQuery}
              aaaSetting={aaaSetting}
              cliApplied={props?.cliApplied}
            />
          </Panel>

          <Panel header={getPanelHeader(AAAServerTypeEnum.TACACS, aaaServerCount.tacasTotalCount)} key='2' >
            <AAAServerTable
              type={AAAServerTypeEnum.TACACS}
              tableQuery={tacasTableQuery}
              aaaSetting={aaaSetting}
              cliApplied={props?.cliApplied}
            />
          </Panel>

          <Panel header={getPanelHeader(AAAServerTypeEnum.LOCAL_USER, aaaServerCount.localUserTotalCount)} key='3' >
            <AAAServerTable
              type={AAAServerTypeEnum.LOCAL_USER}
              tableQuery={localUserTableQuery}
              cliApplied={props?.cliApplied}
            />
          </Panel>
        </Collapse>
      </UI.AAAServers>
    </Loader>
  )
}
