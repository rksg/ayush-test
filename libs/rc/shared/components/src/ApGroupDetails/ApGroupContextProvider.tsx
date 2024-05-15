import { ReactNode, createContext, useContext } from 'react'

import { pick }      from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader }                                                from '@acx-ui/components'
import { useApGroupsListQuery, useGetApGroupsTemplateListQuery } from '@acx-ui/rc/services'
import { ApGroupViewModel, useConfigTemplate }                   from '@acx-ui/rc/utils'


export interface ApGroupContextType extends ApGroupViewModel {
  tenantId: string
  apGroupId?: string
  activeTab?: string
}

export const ApGroupContext = createContext({} as ApGroupContextType)

export function useApGroupContext () {
  return useContext(ApGroupContext)
}

export function ApGroupContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { apGroupId } = params
  const { $t } = useIntl()
  const fields = ['id', 'name', 'venueName', 'venueId', 'members', 'networks']

  const results = useApGroupsListInstance()

  const { data } = results
  const values: ApGroupContextType = {
    ...params,
    ...pick(data?.[0], fields)
  } as ApGroupContextType

  return <ApGroupContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP group {apGroupId}' }, { apGroupId })
    }</Loader>
  </ApGroupContext.Provider>
}

const useApGroupsListInstance = () => {
  const { isTemplate } = useConfigTemplate()
  const { tenantId, apGroupId } = useParams()
  const fields = ['id', 'name', 'venueName', 'venueId', 'members', 'networks']

  const apGroupsListPayload = {
    fields,
    searchTargetFields: ['id'],
    searchString: apGroupId
  }

  const apGroupsListNonTemplate = useApGroupsListQuery({
    params: { tenantId },
    payload: apGroupsListPayload,
    page: 1,
    pageSize: 10
  }, {
    skip: isTemplate,
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  const apGroupsListTemplate = useGetApGroupsTemplateListQuery({
    params: { tenantId },
    payload: apGroupsListPayload,
    page: 1,
    pageSize: 10
  }, {
    skip: !isTemplate,
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  return isTemplate ? apGroupsListTemplate : apGroupsListNonTemplate
}
