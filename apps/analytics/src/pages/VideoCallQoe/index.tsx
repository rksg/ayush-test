import { Button }                 from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, PageHeader, SuspenseBoundary, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { TenantLink }                                    from '@acx-ui/react-router-dom'

import { useVideoCallQoeTestsQuery } from './services'
import { VideoCallQoeTable }         from './VideoCallQoeTable'

const { DefaultFallback: Spinner } = SuspenseBoundary

export function useVideoCallQoe () {
  const { $t } = useIntl()
  const queryResults = useVideoCallQoeTestsQuery(null)
  const title = defineMessage({
    defaultMessage: 'Video Call QoE {count, select, null {} other {({count})}}'
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

  const noOfTestCalls = queryResults.data?.getAllCallQoeTests.length
  const component = <>
    {!useIsSplitOn(Features.NAVBAR_ENHANCEMENT) && <PageHeader
      title={$t(title, { count: null })}
      subTitle={<Loader states={[queryResults]} fallback={<Spinner size='small' />}>
        {$t({ defaultMessage: 'Total Test Calls:' })} {noOfTestCalls}
      </Loader>}
      extra={headerExtra}/>}
    <VideoCallQoeTable />
  </>

  return {
    title: $t(title, { count: queryResults.data?.getAllCallQoeTests.length || 0 }),
    headerExtra,
    component: component
  }
}
