import { ReactNode } from 'react'

import { pick }              from 'lodash'
import { useIntl }           from 'react-intl'
import { useParams, Params } from 'react-router-dom'

import { Loader }                                    from '@acx-ui/components'
import { useApListQuery, useGetApValidChannelQuery } from '@acx-ui/rc/services'
import { ApContext }                                 from '@acx-ui/rc/utils'

export function ApContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { $t } = useIntl()
  const fields = ['serialNumber', 'venueName', 'apMac', 'venueId',
    'apStatusData']
  const results = useApListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields,
      searchTargetFields: ['apMac', 'serialNumber'],
      searchString: params.apId
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })
  const { data } = results
  const apData = pick(data?.[0], fields)
  //eslint-disable-next-line
  const { data: apValidChannels } = useGetApValidChannelQuery({ params: { tenantId: params.tenantId, serialNumber: apData.serialNumber } })
  //eslint-disable-next-line
  const values: Params<string> = { ...params, ...apData as Params<string>, ...apValidChannels as unknown as Params<string> }
  return <ApContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP {apId}' }, params)
    }</Loader>
  </ApContext.Provider>
}