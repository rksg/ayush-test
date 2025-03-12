import { ReactNode } from 'react'

import { pick }              from 'lodash'
import { useIntl }           from 'react-intl'
import { useParams, Params } from 'react-router-dom'

import { Loader }                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { useApListQuery, useGetApValidChannelQuery } from '@acx-ui/rc/services'
import { ApContext }                                 from '@acx-ui/rc/utils'

import { useGetApCapabilities } from '../hooks'

export function ApContextProvider (props: { children: ReactNode }) {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const supportR370 = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const params = useParams()
  const { $t } = useIntl()
  const fields = [
    'serialNumber', 'venueName',
    'apMac', 'venueId',
    'apStatusData', 'model']

  const results = useApListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields,
      searchTargetFields: ['apMac', 'serialNumber'],
      searchString: params.apId
    },
    enableRbac: isWifiRbacEnabled
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })
  const { data } = results
  const apData = pick(data?.[0], fields)

  const { data: apValidChannels }
    = useGetApValidChannelQuery({
      params: { tenantId: params.tenantId, serialNumber: apData.serialNumber }
    }, {
      skip: !apData.serialNumber
    })

  const { data: capabilities } = useGetApCapabilities({
    params,
    modelName: apData?.model,
    skip: !supportR370,
    enableRbac: isWifiRbacEnabled
  })

  //eslint-disable-next-line
  const values: Params<string> = {
    ...params,
    ...apData as Params<string>,
    ...apValidChannels as unknown as Params<string>,
    ...capabilities as unknown as Params<string>
  }

  return <ApContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP {apId}' }, params)
    }</Loader>
  </ApContext.Provider>
}