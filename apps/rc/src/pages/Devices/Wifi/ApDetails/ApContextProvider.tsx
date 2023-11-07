import { ReactNode } from 'react'

import { pick }              from 'lodash'
import { useIntl }           from 'react-intl'
import { useParams, Params } from 'react-router-dom'

import { Loader }         from '@acx-ui/components'
import { useApListQuery } from '@acx-ui/rc/services'
import { ApContext }      from '@acx-ui/rc/utils'

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
  const values: Params<string> = { ...params, ...pick(data?.[0], fields) as Params<string> }
  return <ApContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP {apId}' }, params)
    }</Loader>
  </ApContext.Provider>
}