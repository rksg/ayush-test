import { createContext, useEffect, useState } from 'react'

import { Button }                 from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Tooltip }    from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { useVideoCallQoeTestsQuery } from './services'
import { VideoCallQoeTable }         from './VideoCallQoeTable'

interface CountContextType {
  count: number,
  setCount: (count: number) => void
}
export const CountContext = createContext({} as CountContextType)

export const VideoCallQoe = () => {
  const { component } = useVideoCallQoe()
  return component
}

export function useVideoCallQoe () {
  const { $t } = useIntl()
  const queryResults = useVideoCallQoeTestsQuery(null)
  const [count, setCount] = useState(queryResults.data?.getAllCallQoeTests.length || 0)
  useEffect(()=> setCount(queryResults.data?.getAllCallQoeTests.length || 0),[queryResults])

  const title = defineMessage({
    defaultMessage: 'Video Call QoE {count, select, null {} other {({count})}}',
    description: 'Translation string - Video Call QoE'
  })

  const isCallNotStarted = queryResults.data?.getAllCallQoeTests
    ?.every(test => test.meetings[0].status !== 'NOT_STARTED')
  const headerExtra = [
    isCallNotStarted ?
      <TenantLink to='/analytics/videoCallQoe/add'>
        <Button type='primary'>{$t({ defaultMessage: 'Create Test Call' })}</Button>
      </TenantLink>
      :
      <Tooltip
        placement='left'
        key='disableCallButton'
        trigger='hover'
        title={$t({ defaultMessage: 'There is already a test call which is not started.' })}
      >
        <Button type='primary' disabled>
          {$t({ defaultMessage: 'Create Test Call' })}
        </Button>
      </Tooltip>
  ]

  const component = <CountContext.Provider value={{ count, setCount }}>
    <VideoCallQoeTable />
  </CountContext.Provider>

  return {
    title: $t(title, { count }),
    headerExtra,
    component
  }
}
