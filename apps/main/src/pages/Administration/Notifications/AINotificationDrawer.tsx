import { useRef } from 'react'

import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { NotificationSettings } from '@acx-ui/analytics/components'
import { Drawer, Button }       from '@acx-ui/components'
import { getUserProfile }       from '@acx-ui/user'

import * as UI from './styledComponents'

const title = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'Set your AI notification preferences. These notifications are only sent through email:'
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
  const close = () => setShowDrawer(false)
  const apply = useRef(close)
  return <Drawer
    title={$t({ defaultMessage: 'AI Notifications' })}
    visible={showDrawer}
    onClose={close}
    destroyOnClose
    footer={<UI.FooterWrapper>
      <UI.AfterMsg>{$t(afterMsg)}</UI.AfterMsg>
      <UI.ButtonFooterWrapper>
        <Button
          type='primary'
          onClick={() => {
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
      <div>{$t(title)}</div>
      <Form layout='vertical' autoComplete='off'>
        <NotificationSettings
          tenantId={user.profile.tenantId}
          showLicense={false}
          apply={apply}
        />
      </Form>
    </UI.IncidentNotificationWrapper>
  </Drawer>
}
