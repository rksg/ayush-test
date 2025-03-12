/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  tls_enabled_tooltip: defineMessage({ defaultMessage: 'RadSec is only supported on the Wispr network.' }),
  cn_san_identity_tooltip: defineMessage({ defaultMessage: 'Please ensure the Subject Alternative Name (SAN) matches the server certificate. It will be verified against the configured SAN.' }),
  server_certificate_tooltip: defineMessage({
    defaultMessage: 'A server certificate is required to encrypt RADIUS communication with the server. You can either choose from the existing configured certificates or generate a new certificate as needed.'
  })
}