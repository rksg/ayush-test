import { useIntl } from 'react-intl'

import { Tooltip, Button, cssStr }                 from '@acx-ui/components'
import { ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY } from '@acx-ui/rc/utils'
import { useParams }                               from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface CompatibleAlertBannerProps {
  title: string,
  cacheKey?: string,
  onClick: () => void,
  onClose?: () => void
}

export const CompatibleAlertBanner = (props: CompatibleAlertBannerProps) => {
  const { $t } = useIntl()
  const { title, cacheKey, onClick, onClose } = props
  const { tenantId } = useParams()

  const handleOnClose = () => {
    if (tenantId) {
      sessionStorage.setItem((cacheKey || ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY), tenantId)
      onClose?.()
    }
  }

  return (<UI.AlertNote
    data-testid='compatibility-alert-note'
    message={
      <>
        <Tooltip.Info
          isFilled
          iconStyle={{
            height: '16px',
            width: '16px',
            marginRight: '6px',
            marginBottom: '-3px',
            color: cssStr('--acx-accents-orange-50')
          }} />
        <span style={{ lineHeight: '28px' }}>
          {title}
        </span>
        <Button
          data-testid='compatibility-alert-note-open'
          type='link'
          style={{ fontSize: '12px', marginBottom: '4px' }}
          onClick={onClick}>
          {$t({ defaultMessage: 'See details' })}
        </Button>
      </>}
    type='info'
    closable
    onClose={handleOnClose} />
  )
}