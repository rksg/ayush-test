import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Drawer }              from '@acx-ui/components'
import { useToggleBetaStatusMutation } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

export interface R1BetaTermsConditionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  onClose: () => void
  onSubmit: () => void
  width?: number
}

export function R1BetaTermsConditionDrawer (
  props: R1BetaTermsConditionDrawerProps
) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const [resetField, setResetField] = useState(false)
  const [toggleBetaStatus ] = useToggleBetaStatusMutation()

  const onSave = async () => {
    try {
      await toggleBetaStatus({
        params: {
          enable: true + ''
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
    onClose()
  }

  const onClose = () => {
    setResetField(true)
    setVisible(false)
  }

  return <Drawer
    destroyOnClose={resetField}
    title={$t({ defaultMessage: 'RUCKUS One Beta Terms & Conditions' })}
    visible={visible}
    onClose={onClose}
    width={'430px'}
    children={<UI.DrawerContentWrapper>
      {$t(MessageMapping.enable_r1_beta_terms_condition_drawer_msg)}</UI.DrawerContentWrapper>}
    footer={<UI.FooterWrapper>
      <UI.FooterMsg>
        {$t(MessageMapping.enable_r1_beta_terms_condition_drawer_footer_msg)}</UI.FooterMsg>
      <UI.ButtonFooterWrapper>
        <Button
          type='primary'
          onClick={() => onSave()}>
          {$t({ defaultMessage: 'Enable Beta' })}
        </Button>
        <Button type='default' onClick={() => onClose()}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </UI.ButtonFooterWrapper>
    </UI.FooterWrapper>}
  />
}

export default R1BetaTermsConditionDrawer

