import React from 'react'

import { Form }               from 'antd'
import { get }                from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { PasswordInput }                                                             from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import { AaaServerOrderEnum, AaaServerTypeEnum, NetworkSaveData, useConfigTemplate } from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function AaaServer ( props: {
  serverType: AaaServerTypeEnum,
  summaryData: NetworkSaveData
}) {
  const intl = useIntl()
  const { serverType, summaryData } = props
  const { isTemplate } = useConfigTemplate()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const primaryTitle = intl.$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])
  const secondaryTitle = intl.$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])
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
        summaryData?.[serverType]?.secondary &&
          !summaryData?.[serverType]?.radSecOptions?.tlsEnabled &&
          getAaaServerData(
            secondaryTitle,
            `${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.ip`)}`+
            `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.port`)}`,
            get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.sharedSecret`),
            intl
          )
      }
      {supportRadsec &&
        <Form.Item
          label={intl.$t({ defaultMessage: 'RadSec' })}
          children={intl.$t({ defaultMessage: '{tlsEnabled}' }, {
            tlsEnabled: get(summaryData, `${serverType}.radSecOptions.tlsEnabled`) ? 'On' : 'Off'
          })}
        />}
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
      {sharedSecret && <Form.Item
        label={intl.$t({ defaultMessage: 'Shared Secret:' })}
        children={<PasswordInput
          readOnly
          bordered={false}
          value={sharedSecret}
        />}
      />}
    </React.Fragment>
  )
}
