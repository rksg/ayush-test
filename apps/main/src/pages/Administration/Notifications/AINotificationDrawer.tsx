import { useRef } from 'react'

import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { NotificationSettings }       from '@acx-ui/analytics/components'
import { Drawer, Button }             from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import { R1NotificationSettings } from './R1NotificationSettings'
import * as UI                    from './styledComponents'

const title = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'Set your AI notification preferences. These notifications are only sent through email:'
})
const titleChannelSelection = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'Set preferences for Incidents, Notification Types and Recommendations. These notifications will be sent only to the recipients whose emails are activated.'
})

const titleChannelSelectionForCoreTier = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'Set preferences for Notification Types. These notifications will be sent only to the recipients whose emails are activated.'
})

const afterMsg = defineMessage({
  defaultMessage: 'This will apply to all the recipients defined for this account.'
})

export const AINotificationDrawer = ({
  showDrawer,
  setShowDrawer
}: {
  showDrawer: boolean,
  setShowDrawer: CallableFunction
}) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const isCore = isCoreTier(user.accountTier)
  const close = () => setShowDrawer(false)
  const apply = useRef(close)
  const applyR1 = useRef(close)
  const notificationChannelEnabled = useIsSplitOn(Features.NOTIFICATION_CHANNEL_SELECTION_TOGGLE)

  const titleNotification = notificationChannelEnabled
    ? $t({ defaultMessage: 'Notifications Preferences' })
    : $t({ defaultMessage: 'AI Notifications' })

  return <Drawer
    title={titleNotification}
    visible={showDrawer}
    onClose={close}
    destroyOnClose
    footer={<UI.FooterWrapper>
      <UI.AfterMsg>{$t(afterMsg)}</UI.AfterMsg>
      <UI.ButtonFooterWrapper>
        <Button
          type='primary'
          onClick={() => {
            if (notificationChannelEnabled) {
              applyR1.current()
            }
            apply.current()
            close()
          }}>
          {$t({ defaultMessage: 'Apply' })}
        </Button>
        <Button type='default' onClick={close}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </UI.ButtonFooterWrapper>
    </UI.FooterWrapper>}
  >
    <UI.IncidentNotificationWrapper>
      <div>{notificationChannelEnabled ?
        (isCore ? $t(titleChannelSelectionForCoreTier) : $t(titleChannelSelection))
        : $t(title)}</div>
      <Form layout='vertical'>
        {notificationChannelEnabled && <R1NotificationSettings
          tenantId={user.profile.tenantId}
          apply={applyR1}
        />}
        { !isCore && <NotificationSettings
          tenantId={user.profile.tenantId}
          apply={apply}
        />
        }
      </Form>
    </UI.IncidentNotificationWrapper>
  </Drawer>
}
