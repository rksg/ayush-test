import { kebabCase } from 'lodash'
import { useIntl }   from 'react-intl'
import sanitize      from 'sanitize-filename'

import {
  Button,
  Loader,
  SuspenseBoundary,
  Tooltip
} from '@acx-ui/components'
import { DownloadOutlined } from '@acx-ui/icons'

import { useIntentContext }              from '../../IntentContext'
import { DownloadWrapper }               from '../../styledComponents'
import { IntentDetail, useDownloadUrl }  from '../../useIntentDetailsQuery'
import { useIntentAIPowerSavePlanQuery } from '../services'

const { DefaultFallback: Spinner } = SuspenseBoundary

export function DownloadPowerSavePlan () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const queryResult = useIntentAIPowerSavePlanQuery()
  const { url, filename } = useDownloadData(intent, queryResult)

  return <DownloadWrapper>
    <Loader states={[queryResult]} fallback={<Spinner size='default' />}>
      <Tooltip
        placement='top'
        title={$t({ defaultMessage:
          'The CSV is generated based on the last execution of the \'Energy Saving\' model.'
        })}
      >
        <Button
          size='middle'
          icon={<DownloadOutlined/>}
          download={filename}
          href={url}
          type={'primary'}
        >{$t({ defaultMessage: 'Download PowerSave Plan' })}</Button>
      </Tooltip>
    </Loader>
  </DownloadWrapper>
}

export const useDownloadData = (
  intent: IntentDetail, dataQuery: ReturnType<typeof useIntentAIPowerSavePlanQuery>
) => {
  const url = useDownloadUrl(dataQuery.data?.csv, 'text/csv')
  const filename = sanitize([
    kebabCase(intent.sliceValue),
    'day-to-day'
  ].join('-') + '.csv')

  return {
    url,
    filename
  }
}
