import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, SuspenseBoundary } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'

import { VideoCallQoeTable } from '../VideoCallQoeTable'

import { useVideoCallQoeTestsQuery } from './services'

const { DefaultFallback: Spinner } = SuspenseBoundary

function VideoCallQoeListPage () {
  const { $t } = useIntl()
  const queryResults = useVideoCallQoeTestsQuery(null)
  const noOfTestCalls = queryResults.data?.getAllCallQoeTests.length

  if (!useIsSplitOn(Features.VIDEO_CALL_QOE)) {
    return <span>{ $t({ defaultMessage: 'Video Call QoE is not enabled' }) }</span>
  }

  return (
    <><PageHeader
      title={$t({ defaultMessage: 'Video Call QoE\n' })}
      subTitle={<Loader states={[queryResults]} fallback={<Spinner size='small' />}>
        {$t({ defaultMessage: 'Total Test Calls:' })} {noOfTestCalls}
      </Loader>}
      extra={[
        <Button type='primary'>{$t({ defaultMessage: 'Create Test Call' })}</Button>
      ]} /><VideoCallQoeTable /></>
  )
}
export default VideoCallQoeListPage
