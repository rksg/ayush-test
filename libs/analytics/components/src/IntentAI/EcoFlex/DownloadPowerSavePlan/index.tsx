import { useState } from 'react'

import { kebabCase } from 'lodash'
import { useIntl }   from 'react-intl'
import sanitize      from 'sanitize-filename'

import {
  Button,
  Tooltip
} from '@acx-ui/components'
import { DownloadOutlined }       from '@acx-ui/icons'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { useIntentContext }                    from '../../IntentContext'
import { DownloadWrapper }                     from '../../styledComponents'
import { useIntentParams }                     from '../../useIntentDetailsQuery'
import { useLazyApPowerSaveDistributionQuery } from '../services'

export function DownloadPowerSavePlan () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const params = useIntentParams()
  const [getApPowerSaveDistribution] = useLazyApPowerSaveDistributionQuery()

  const [isLoading, setIsLoading] = useState(false)
  const filename = sanitize([
    'PowerSavePlan',
    kebabCase(intent.sliceValue)
  ].join('-') + '.csv')

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const result = await getApPowerSaveDistribution(params).unwrap()
      if (result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv' })
        handleBlobDownloadFile(blob, filename)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return <DownloadWrapper>
    <Tooltip
      placement='top'
      title={$t({ defaultMessage:
          'The CSV is generated based on the last execution of the \'Energy Saving\' model.'
      })}
    >
      <Button
        size='middle'
        icon={<DownloadOutlined/>}
        onClick={handleDownload}
        loading={isLoading}
        disabled={isLoading}
        type={'primary'}
      >{$t({ defaultMessage: 'Download PowerSave Plan' })}</Button>
    </Tooltip>
  </DownloadWrapper>
}