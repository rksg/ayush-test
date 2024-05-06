import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { UpdateFirmwarePerApModelPanel, UpdateFirmwarePerApModelPanelProps } from '../UpdateNowDialog/UpdateFirmwarePerApModelPanel'

export default function FirmwareSelectorPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()

  return (<>
    <Typography style={{ fontWeight: 700, marginBottom: 12 }}>
      { // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Choose which version to schedule the <venueSingular></venueSingular> to:' }) }
    </Typography>
    <UpdateFirmwarePerApModelPanel {...props} />
  </>)
}
