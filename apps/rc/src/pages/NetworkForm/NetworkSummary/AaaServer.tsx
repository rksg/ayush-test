import React from 'react'

import { Form, Input }        from 'antd'
import { get }                from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { AaaServerOrderEnum, AaaServerTypeEnum, NetworkSaveData } from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function AaaServer ( props: {
  serverType: AaaServerTypeEnum,
  summaryData: NetworkSaveData
}) {
  const intl = useIntl()
  const { serverType, summaryData } = props
  const primaryTitle = intl.$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])
  const secondaryTitle = intl.$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])
  
  const enableSecondaryServer = serverType === AaaServerTypeEnum.AUTHENTICATION ? 
    summaryData.enableSecondaryAuthServer : 
    summaryData.enableSecondaryAcctServer 
  
  return (    
    <React.Fragment>
      {getAaaServerData(
        primaryTitle,
        `${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.ip`)}`+
          `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.port`)}`,
        get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.sharedSecret`),
        intl
      )}
      {
        enableSecondaryServer && 
          getAaaServerData(
            secondaryTitle,
            `${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.ip`)}`+
            `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.port`)}`,
            get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.sharedSecret`),
            intl
          )
      }
    </React.Fragment>
  )
}
  
function getAaaServerData (
  title: string,
  ipPort: string,
  sharedSecret: string,
  intl: IntlShape
) {
  return (    
    <React.Fragment>
      <Form.Item
        label={intl.$t({ defaultMessage: '{title}:' }, { title })}
        children={ipPort} />
      <Form.Item
        label={intl.$t({ defaultMessage: 'Shared Secret:' })}
        children={<Input.Password
          readOnly
          bordered={false}
          value={sharedSecret}
        />}
      />
    </React.Fragment>
  )
}