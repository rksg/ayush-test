import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { Button, Drawer, showActionModal }                                                                                  from '@acx-ui/components'
import { BetaListDetails }                                                                                                  from '@acx-ui/feature-toggle'
import { Feature, FeatureAPIResults, useToggleBetaStatusMutation, useUpdateBetaFeatureListMutation, useUserProfileContext } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

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
  const params = useParams()
  const [resetField, setResetField] = useState(false)
  const [featureList, setFeatureList] = useState<Feature[]>([])
  const [toggleBetaStatus ] = useToggleBetaStatusMutation()
  const { betaFeaturesList } = useUserProfileContext()
  const [updateBetaFeatures] = useUpdateBetaFeatureListMutation()

  const onSave = async () => {
    onClose()
    try {
      await toggleBetaStatus({
        params: {
          enable: true + ''
        }
      }).unwrap()
      await updateBetaFeatures({ params, payload: featureList as FeatureAPIResults[] }).unwrap()
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
    if (betaFeaturesList) {
      const features = betaFeaturesList.map(f => {
        const desc = $t(BetaListDetails.filter(detail => detail.key === f.key)[0].description)
        const updatedFeature: Feature = {
          name: desc.split(': ')[0],
          desc: desc.split(': ')[1],
          ...f
        }
        return updatedFeature
      })
      setFeatureList(features)
    }
  }, [betaFeaturesList])

  const onFeatureToggle = (checked: boolean, e: React.MouseEvent, feature: string) => {
    const features = featureList.map(f => {
      if (f.key === feature) {
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
          return <UI.DrawerContent key={feature.key}>
            <UI.FeatureTitleWrapper>
              <UI.FeatureTitle>{feature.name}</UI.FeatureTitle>
              <UI.EarlyAccessFeatureSwitch
                checkedChildren='ON'
                unCheckedChildren='OFF'
                defaultChecked={feature.enabled}
                checked={feature.enabled}
                onChange={(checked, e) => onFeatureToggle(checked, e, feature.key)} />
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

