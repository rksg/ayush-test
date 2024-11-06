/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  tls_enabled_tooltip: defineMessage({ defaultMessage: 'RadSec is only supported on the Wispr network.' }),
  cn_san_identity_tooltip: defineMessage({ defaultMessage: 'Please ensure the Common Name (CN) or Subject Alternative Name (SAN) matches the server certificate. It will be verified against the configured CN/SAN.' })
}