import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button }                 from '@acx-ui/components'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { useClientPcapMutation } from './services'
import { PcapSpin, PcapWrapper } from './styledComponents'

export function DownloadPcap ({
  pcapFilename
}: {
  pcapFilename: string
}) {
  const [getPcap] = useClientPcapMutation()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { $t } = useIntl()
  const onClick = () => {
    setIsLoading(true)
    getPcap({ filename: pcapFilename })
      .unwrap()
      .then(({ pcapFile }) => {
        setIsLoading(false)
        handleBlobDownloadFile(pcapFile, pcapFilename)
      })
      .catch(() => {
        setIsLoading(false)
        setError($t({ defaultMessage: 'File not found, please try again later.' }))
      })
  }

  return <PcapWrapper>
    {isLoading
      ? <PcapSpin />
      : <Button
        type='default'
        disabled={Boolean(error)}
        onClick={() => onClick()}
      >
        {error
          ? error
          : $t({ defaultMessage: 'Download .pcap' })}
      </Button>}
  </PcapWrapper>
}
