import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader, SuspenseBoundary, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { TenantLink }                                    from '@acx-ui/react-router-dom'

import { useVideoCallQoeTestsQuery } from './services'
import { VideoCallQoeTable }         from './VideoCallQoeTable'


const { DefaultFallback: Spinner } = SuspenseBoundary

function VideoCallQoeListPage () {
  const { $t } = useIntl()
  const queryResults = useVideoCallQoeTestsQuery(null)
  const noOfTestCalls = queryResults.data?.getAllCallQoeTests.length

  if (!useIsSplitOn(Features.VIDEO_CALL_QOE)) {
    return <span>{ $t({ defaultMessage: 'Video Call QoE is not enabled' }) }</span>
  }

  const isNotStartedCall = queryResults.data?.getAllCallQoeTests
    ?.every(test => test.meetings[0].status !== 'NOT_STARTED')


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Video Call QoE' })}
        subTitle={<Loader states={[queryResults]} fallback={<Spinner size='small' />}>
          {$t({ defaultMessage: 'Total Test Calls:' })} {noOfTestCalls}
        </Loader>}
        extra={[
          isNotStartedCall ?
            <TenantLink to='/serviceValidation/videoCallQoe/add'>
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
        ]} />
      <VideoCallQoeTable />
    </>
  )
}
export default VideoCallQoeListPage
