import { useIntl } from 'react-intl'

import { Button }                 from '@acx-ui/components'
import { handleBlobDownloadFile } from '@acx-ui/utils'

import { DisplayEvent }          from './config'
import { useClientPcapMutation } from './services'

export function DownloadPcap ({
  pcapFilename
}: {
  pcapFilename: DisplayEvent['pcapFilename']
}) {
  const [getPcap] = useClientPcapMutation()
  const { $t } = useIntl()
  const onClick = () => {
    getPcap({ filename: pcapFilename! })
      .unwrap()
      .then(({ pcapFile }) => {
        handleBlobDownloadFile(pcapFile, pcapFilename!)
      })
  }

  return <Button type='default' onClick={() => onClick()}>
    {$t({ defaultMessage: 'Download .pcap' })}
  </Button>
}