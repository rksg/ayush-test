/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  clusterWarningMsg: defineMessage({ defaultMessage: `The cluster function will operate
    when there are at least two nodes present. Please add more nodes to establish
    a complete cluster.` }),

  otpWarningMsg: defineMessage({ defaultMessage: `The one-time-password (OTP) will be
    automatically sent to your email address or via SMS for verification when you add
    a virtual RUCKUS Edge node. The password will expire in 10 minutes and you must
    complete the authentication process before using it.` }),

  activeActiveMessage: defineMessage({ defaultMessage: `All RUCKUS Edges work together and
    balance the load, enhancing redundancy and performance. If one RUCKUS Edge fails, the
    rest take over the tasks.` }),

  activeStandbyMessage: defineMessage({ defaultMessage: `Active-standby high availability
    has one active RUCKUS Edge handling tasks while a standby RUCKUS Edge waits to take over
    if the active RUCKUS Edge fails.` })

}