/* eslint-disable max-len */
import { Collapse } from 'antd'
import { defineMessage, useIntl }  from 'react-intl'

import { Alert }                                                   from '@acx-ui/components'
import { useGetAaaSettingQuery, useVenueSwitchAAAServerListQuery } from '@acx-ui/rc/services'
import { useTableQuery, AAAServerTypeEnum }                        from '@acx-ui/rc/utils'
import { useParams }                                               from '@acx-ui/react-router-dom'

import { AAAServerTable }  from './AAAServerTable'
import { AAANotification } from './contentsMap'
import * as UI             from './styledComponents'

const { Panel } = Collapse

const PanelHeader = {
  [AAAServerTypeEnum.RADIUS]: defineMessage({ defaultMessage: 'RADIUS Servers ({count})' }),
  [AAAServerTypeEnum.TACACS]: defineMessage({ defaultMessage: 'TACACS+ Servers ({count})' }),
  [AAAServerTypeEnum.LOCAL_USER]: defineMessage({ defaultMessage: 'Local Users ({count})' })
}

export function AAAServers () {
  const { tenantId, venueId } = useParams()
  const { $t } = useIntl()

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

  const { data: aaaSetting } = useGetAaaSettingQuery({ params: { tenantId, venueId } })

  const radiusTableQuery = useTableQuery({
    useQuery: useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.RADIUS],
    pagination: {
      pageSize: 5
    }
  })

  const tacasTableQuery = useTableQuery({
    useQuery: useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.TACACS],
    pagination: {
      pageSize: 5
    }
  })

  const localUserTableQuery = useTableQuery({
    useQuery: useVenueSwitchAAAServerListQuery,
    defaultPayload: payloadMap[AAAServerTypeEnum.LOCAL_USER],
    pagination: {
      pageSize: 5
    }
  })

  return (
    <UI.AAAServers>
      {
        radiusTableQuery?.data?.totalCount === 0 && tacasTableQuery?.data?.totalCount === 0 &&
        <Alert message={$t(AAANotification)} type='info' showIcon />
      }
      <Collapse
        defaultActiveKey={['1', '2', '3']}
        expandIconPosition='end'
        ghost={true}
        bordered={false}
      >
        <Panel header={getPanelHeader(AAAServerTypeEnum.RADIUS, 0)} key='1' >
          <AAAServerTable type={AAAServerTypeEnum.RADIUS} tableQuery={radiusTableQuery} aaaSetting={aaaSetting} />
        </Panel>

        <Panel header={getPanelHeader(AAAServerTypeEnum.TACACS, 0)} key='2' >
          <AAAServerTable type={AAAServerTypeEnum.TACACS} tableQuery={tacasTableQuery} aaaSetting={aaaSetting} />
        </Panel>

        <Panel header={getPanelHeader(AAAServerTypeEnum.LOCAL_USER, 0)} key='3' >
          <AAAServerTable type={AAAServerTypeEnum.LOCAL_USER} tableQuery={localUserTableQuery} />
        </Panel>
      </Collapse>
    </UI.AAAServers>
  )
}
