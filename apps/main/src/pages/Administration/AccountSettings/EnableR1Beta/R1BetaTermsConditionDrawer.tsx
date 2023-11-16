import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer }                                     from '@acx-ui/components'
import { useParams }                                          from '@acx-ui/react-router-dom'
import { useToggleBetaStatusMutation, useGetBetaStatusQuery } from '@acx-ui/user'

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
  const [form] = Form.useForm()
  const params = useParams()
  const { data: betaStatus } = useGetBetaStatusQuery({ params })
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

  // eslint-disable-next-line max-len
  const termsCondition = $t({ defaultMessage: 'Ruckus Wireless, Inc. (“RUCKUS”) is providing you with access to certain product features and capabilities that are not yet commercially available and that are still being evaluated for general release. As such, these features and capabilities are provided “AS IS” and RUCKUS expressly disclaims all warranties, whether express, implied, statutory or otherwise, including without limitation any conditions or warranties of merchantability, performance, fitness for a particular purpose or use, and non infringement. The foregoing disclaimers shall apply to the fullest extent permitted by law. RUCKUS disclaims any and all liability in connection with your access to and use of beta features and capabilities. RUCKUS may modify, discontinue, or terminate your access to these features and capabilities at anytime at its sole discretion.' })

  // eslint-disable-next-line max-len
  const footerMsg = $t({ defaultMessage: 'By clicking “Enable Beta”, you agree to the RUCKUS One Beta Terms & Conditions' })

  useEffect(() => {
    const betaStatusCb = betaStatus?.enabled === 'true'?? false
    // console.log('betaStatusCb', betaStatusCb)
    form.setFieldValue('betaStatusCbox', betaStatusCb)

  }, [betaStatus?.enabled])

  return <Drawer
    destroyOnClose={resetField}
    title={$t({ defaultMessage: 'RUCKUS One Beta Terms & Conditions' })}
    visible={visible}
    onClose={onClose}
    width={'430px'}
    children={<UI.DrawerContentWrapper>{termsCondition}</UI.DrawerContentWrapper>}
    footer={<UI.FooterWrapper>
      <UI.FooterMsg>{footerMsg}</UI.FooterMsg>
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

