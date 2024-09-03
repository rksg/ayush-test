import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, Drawer, showActionModal } from '@acx-ui/components'
import { useToggleBetaStatusMutation }     from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

export interface Feature {
  name: string,
  desc: string,
  enabled: boolean
}
const fakeFeatures: Feature[] = [
  {
    name: 'DPSK3',
    // eslint-disable-next-line max-len
    desc: 'Dynamic Preshared Keys working with WPA3-DSAE. Users connect their devices to a WPA2/WPA3 network with DPSK and are automatically moved to the WPA3 WLAN, allowing DPSK operation with WiFi 6e or WiFi7. DPSK3 allows the customer to take advantage of the flexibility of DPSK with the security of WPA3.',
    enabled: true
  },
  {
    name: 'SmartEdge',
    // eslint-disable-next-line max-len
    desc: 'RUCKUS SmartEdge is a platfrom to run RUCKUS services on. Network administrators can utilize SD-LAN service or Personal Identity Networking service on a SmartEdge. SD-LAN provides WLAN tunnelling using VXLAN. This will provide end users a seamless roaming experience across a network. The Personal Identity Networking service provides individual networks for users which is typically used in a multi-dwelling facility.',
    enabled: false
  },
  {
    name: 'Feature 3',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: true
  },
  {
    name: 'Feature 4',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: true
  },
  {
    name: 'Feature 5',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: false
  }
]

export interface R1FeatureListDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  width?: number
  editMode?: boolean
}

function R1FeatureListDrawer (
  props: R1FeatureListDrawerProps
) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode } = props
  const [resetField, setResetField] = useState(false)
  const [featureList, setFeatureList] = useState<Feature[]>([])
  const [toggleBetaStatus ] = useToggleBetaStatusMutation()

  const onSave = async () => {
    onClose()
    try {
      await toggleBetaStatus({
        params: {
          enable: true + ''
        }
      }).unwrap()
      // eslint-disable-next-line no-console
      console.log(featureList)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onClose = () => {
    setResetField(true)
    setVisible(false)
  }

  useEffect(() => {
    setFeatureList(fakeFeatures)
  }, [fakeFeatures])

  const onFeatureToggle = (checked: boolean, e: React.MouseEvent, feature: string) => {
    const features = featureList.map(f => {
      if (f.name === feature) {
        f.enabled = checked
      }
      return f
    })
    setFeatureList(features)
  }

  const onShowTermsAndConditions = () => {
    showActionModal({
      type: 'info',
      width: 450,
      title: $t({ defaultMessage: 'Early Access Terms & Conditions' }),
      content: $t(MessageMapping.enable_r1_beta_terms_condition_drawer_msg),
      okText: $t({ defaultMessage: 'OK' }),
      onOk: () => {}
    })
  }

  return <Drawer
    destroyOnClose={resetField}
    title={$t({ defaultMessage: 'Early Access Features' })}
    icon={<UI.OrangeRocketOutlined/>}
    visible={visible}
    onClose={onClose}
    width={'430px'}
    children={
      <UI.DrawerContentWrapper>
        {featureList.map(feature => {
          return <UI.DrawerContent key={feature.name}>
            <UI.FeatureTitleWrapper>
              <UI.FeatureTitle>{feature.name}</UI.FeatureTitle>
              <UI.EarlyAccessFeatureSwitch
                checkedChildren='ON'
                unCheckedChildren='OFF'
                defaultChecked={feature.enabled}
                checked={feature.enabled}
                onChange={(checked, e) => onFeatureToggle(checked, e, feature.name)} />
            </UI.FeatureTitleWrapper>
            <UI.FeatureDescription>{feature.desc}</UI.FeatureDescription>
          </UI.DrawerContent>
        })}
      </UI.DrawerContentWrapper>}
    footer={<UI.FooterWrapper editMode={editMode}>
      <UI.FooterMsg>
        { editMode
          ? <Typography.Link role='link' onClick={onShowTermsAndConditions}>
            {$t({ defaultMessage: 'Terms & Conditions' })}
          </Typography.Link>
          : $t(MessageMapping.enable_r1_early_access_terms_condition_drawer_footer_msg,
            { tc: <Typography.Link role='link' onClick={onShowTermsAndConditions}>
              {$t({ defaultMessage: 'Terms & Conditions' })}
            </Typography.Link> }
          )}
      </UI.FooterMsg>
      <UI.ButtonFooterWrapper editMode={editMode}>
        <Button
          type='primary'
          onClick={() => onSave()}>
          {editMode ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Enable Early Access' })}
        </Button>
        <Button type='default' onClick={() => onClose()}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </UI.ButtonFooterWrapper>
    </UI.FooterWrapper>}
  />
}

export { R1FeatureListDrawer }

