import { createContext, ReactNode, useContext } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader }                    from '@acx-ui/components'
import { useGetApWiredClientsQuery } from '@acx-ui/rc/services'
import { ApWiredClientInfo }         from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const ApWiredClientContext = createContext({} as { clientInfo: ApWiredClientInfo | undefined })

export const useApWiredClientContext = () => {
  return useContext(ApWiredClientContext)
}

export function ApWiredClientContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { $t } = useIntl()

  const fields = [
    'hostname', 'macAddress', 'ipAddress',
    'deviceType', 'osType', 'authStatus',
    'venueName', 'venueId',
    'apId', 'apMacAddress', 'apName',
    'portNumber', 'vlanId'
  ]

  const results = useGetApWiredClientsQuery({ payload: {
    fields,
    filters: { macAddress: [params.clientId] }
  } }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  const { data } = results
  const clientInfo = data?.[0]

  const values = {
    clientInfo: clientInfo
  }

  return <ApWiredClientContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find Wired Client {clientId}' }, params)
    }</Loader>
  </ApWiredClientContext.Provider>
}