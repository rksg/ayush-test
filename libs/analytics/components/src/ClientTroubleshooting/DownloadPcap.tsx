import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, showToast }          from '@acx-ui/components'
import { getUserProfile, isCoreTier } from '@acx-ui/user'
import { handleBlobDownloadFile }     from '@acx-ui/utils'

import { useClientPcapMutation }           from './services'
import { PcapSpin, PcapText, PcapWrapper } from './styledComponents'

export function DownloadPcap ({
  pcapFilename
}: {
  pcapFilename: string
}) {
  const [getPcap] = useClientPcapMutation()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { $t } = useIntl()
  const { accountTier, profile } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const isSupportUser = Boolean(profile?.support)
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
        showToast({
          type: 'error',
          content: $t(
            { defaultMessage: 'File not found, please try again later.' }
          )
        })
        setError($t({ defaultMessage: 'File not found, please try again later.' }))
      })
  }

  const hasPermission = isCore ? isSupportUser: true

  return <PcapWrapper>
    {isLoading
      ? <PcapSpin />
      : (hasPermission && <Button
        type='default'
        disabled={Boolean(error)}
        onClick={() => onClick()}
      >
        <PcapText>
          {$t({ defaultMessage: 'Download .pcap' })}
        </PcapText>
      </Button>)}
  </PcapWrapper>
}
