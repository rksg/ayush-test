import { useEffect, useState } from 'react'

import { kebabCase } from 'lodash'
import { useIntl }   from 'react-intl'
import sanitize      from 'sanitize-filename'

import {
  Button,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'
import { DownloadOutlined } from '@acx-ui/icons'

import { useIntentContext } from '../../IntentContext'
import { IntentDetail }     from '../../useIntentDetailsQuery'

import { intentBandMapping, useIntentAICRRMQuery } from './services'
import { DownloadWrapper }                         from './styledComponents'

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

export function DownloadRRMComparison (props: { title?: string }) {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const queryResult = useIntentAICRRMQuery()
  const { url, filename } = useDownloadData(intent)

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

export const useDownloadData = (intent: IntentDetail) => {
  const band = intentBandMapping[intent.code as keyof typeof intentBandMapping]
  const queryResult = useIntentAICRRMQuery()
  const url = useDownloadUrl(queryResult.csv, 'text/csv')

  const filename = sanitize([
    'rrm-comparison',
    kebabCase(intent.sliceValue),
    kebabCase(formatter('radioFormat')(band).toLowerCase())
  ].join('-') + '.csv')

  return {
    url,
    filename
  }
}
