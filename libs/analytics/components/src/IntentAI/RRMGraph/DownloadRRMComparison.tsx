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

import { EnhancedIntent } from '../IntentAIForm/services'

import { useIntentAICRRMQuery } from './services'
import { DownloadWrapper }      from './styledComponents'

const { DefaultFallback: Spinner } = SuspenseBoundary

const useDownloadUrl = (data: unknown, type: string) => {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!data) return
    const url = URL.createObjectURL(new Blob([data as BlobPart], { type }))
    setUrl(url)
    return () => URL.revokeObjectURL(url!)
  }, [data, type])
  return url
}

export function DownloadRRMComparison (props: {
  details: EnhancedIntent,
  title?: string
}) {
  const { $t } = useIntl()
  const band = recommendationBandMapping[
    props.details.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(props.details?.id, band)
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
        type={'primary'}
      >{props.title || $t({ defaultMessage: 'Download RRM comparison' })}</Button>
    </Loader>
  </DownloadWrapper>
}
