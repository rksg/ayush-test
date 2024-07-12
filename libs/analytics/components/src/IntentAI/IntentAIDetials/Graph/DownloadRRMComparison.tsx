import { useEffect, useState } from 'react'

import { kebabCase } from 'lodash'
import { useIntl }   from 'react-intl'
import sanitize      from 'sanitize-filename'

import {
  Button,
  Loader,
  SuspenseBoundary,
  recommendationBandMapping
} from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'
import { DownloadOutlined } from '@acx-ui/icons'

<<<<<<<< HEAD:libs/analytics/components/src/IntentAI/AIDrivenRRM/Graph/DownloadRRMComparison.tsx
import { EnhancedRecommendation } from '../services'
========
import { EnhancedRecommendation } from '../../IntentAIForm/services'
>>>>>>>> feature/MLSA-7981:libs/analytics/components/src/IntentAI/IntentAIDetials/Graph/DownloadRRMComparison.tsx

import { useIntentAICRRMQuery } from './services'
import { DownloadWrapper }      from './styledComponents'

const { DefaultFallback: Spinner } = SuspenseBoundary

const useDownloadUrl = (data: unknown, type: string) => {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!data) return
    setUrl(URL.createObjectURL(new Blob([data as BlobPart], { type })))
    return () => URL.revokeObjectURL(url!)
  }, [data])
  return url
}

export function DownloadRRMComparison (props: {
  details: EnhancedRecommendation,
  title?: string
}) {
  const { $t } = useIntl()
  const band = recommendationBandMapping[
    props.details.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(props.details, band)
  const url = useDownloadUrl(queryResult.csv, 'text/csv')

  const filename = sanitize([
    'rrm-comparison',
    kebabCase(props.details.sliceValue),
    kebabCase(formatter('radioFormat')(band).toLowerCase())
  ].join('-') + '.csv')

  return <DownloadWrapper>
    <Loader states={[queryResult]} fallback={<Spinner size='default' />}>
      <Button
        size='middle'
        icon={<DownloadOutlined/>}
        download={filename}
        href={url}
      >{props.title || $t({ defaultMessage: 'Download RRM comparison' })}</Button>
    </Loader>
  </DownloadWrapper>
}
