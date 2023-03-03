// import { useIntl } from 'react-intl'

import { VenueFirmwareList } from './VenueFirmwareList'
import VersionBanner         from './VersionBanner'

const ApFirmware = () => {
  // const { $t } = useIntl()
  // return <>{$t({ defaultMessage: 'Ap Firmware Version Management' })}</>

  return (
    <>
      <VersionBanner />
      <VenueFirmwareList />
    </>
  )
}

export default ApFirmware
