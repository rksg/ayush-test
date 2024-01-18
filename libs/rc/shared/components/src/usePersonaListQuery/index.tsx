import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                                                                       from '@acx-ui/feature-toggle'
import { useGetPersonaGroupByIdQuery, useLazyGetDpskPassphraseDevicesQuery, useSearchPersonaListQuery } from '@acx-ui/rc/services'
import { DPSKDeviceInfo, Persona, useTableQuery }                                                       from '@acx-ui/rc/utils'

import { useDpskNewConfigFlowParams } from '../services'

interface UsePersonaListQueryProps {
  personaGroupId?: string
}

export const usePersonaListQuery = (props: UsePersonaListQueryProps) => {
  const { personaGroupId } = props
  const { tenantId } = useParams()
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)
  const [dataSource, setDataSource] = useState<Persona[]>([])
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()

  const personaGroupQuery = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    { skip: !personaGroupId }
  )
  const personaListTableQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: ''
    }
  })
  const [getDpskDevices] = useLazyGetDpskPassphraseDevicesQuery()
  const { data, ...rest } = personaListTableQuery

  useEffect(() => {
    if(!personaGroupId) return
    personaListTableQuery.setPayload({
      keyword: '',
      groupId: personaGroupId
    })
  }, [personaGroupId])

  useEffect(() => {
    if (!personaGroupQuery.data || !personaListTableQuery.data) return

    const serviceId = personaGroupQuery.data?.dpskPoolId
    if (!serviceId) return

    const requests = [] as Promise<unknown>[]
    personaListTableQuery?.data.data.forEach(persona => {
      const passphraseId = persona.dpskGuid
      if (!passphraseId) return
      requests.push(getDpskDevices({
        params: { tenantId, passphraseId, serviceId, ...dpskNewConfigFlowParams }
      }))
    })

    Promise.all(requests).then((res) => {
      const dpskDeviceCounts = res.reduce((acc: { [key: string]: number }, cur) => {
        const item = (cur as { data: DPSKDeviceInfo[] }).data
        if(!item || item.length === 0) return acc
        const count = item.filter(d =>
          isNewConfigFlow
            ? d.deviceConnectivity === 'CONNECTED'
            : d.online
        ).length
        acc[item[0].devicePassphrase] = count
        return acc
      }, {}) as { [key: string]: number }
      const result = personaListTableQuery.data?.data.map(item => ({
        ...item,
        deviceCount: (item.deviceCount ?? 0) + (dpskDeviceCounts[item.dpskGuid ?? ''] ?? 0)
      }))
      setDataSource(result as Persona[])
    })

  }, [
    personaListTableQuery.isLoading,
    personaListTableQuery.isFetching,
    personaGroupQuery.isLoading]
  )

  return {
    data: dataSource.length === 0 ?
      data :
      {
        ...data,
        data: dataSource
      },
    ...rest
  }
}