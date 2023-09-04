import { useEffect, useState } from 'react'

import { kebabCase } from 'lodash'
import { useIntl }   from 'react-intl'
import sanitize      from 'sanitize-filename'

import { Button, Loader, recommendationBandMapping, SuspenseBoundary } from '@acx-ui/components'
import { formatter }                                                   from '@acx-ui/formatter'
import { DownloadOutlined }                                            from '@acx-ui/icons'

import { useCRRMQuery }    from './services'
import { DownloadWrapper } from './styledComponents'

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

export function DownloadRRMComparison (props: { title?: string }) {
  const { $t } = useIntl()
  const { recommendation, queryResult } = useCRRMQuery()
  const url = useDownloadUrl(queryResult.csv, 'text/csv')

  const band = recommendationBandMapping[
    recommendation.data?.code as keyof typeof recommendationBandMapping]
  const filename = sanitize([
    'rrm-comparison',
    kebabCase(recommendation.data?.sliceValue),
    kebabCase(formatter('radioFormat')(band).toLowerCase())
  ].join('-') + '.csv')

  return <DownloadWrapper>
    <Loader states={[recommendation, queryResult]} fallback={<Spinner size='default' />}>
      <Button
        size='small'
        disabled={!!recommendation.data?.monitoring}
        icon={<DownloadOutlined/>}
        download={filename}
        href={url}
      >{props.title || $t({ defaultMessage: 'Download RRM comparison' })}</Button>
    </Loader>
  </DownloadWrapper>
}

