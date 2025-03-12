import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { BetaIndicator, Button, Drawer, showActionModal } from '@acx-ui/components'
import { BetaListDetails }                                from '@acx-ui/feature-toggle'
import {
  Feature,
  useGetBetaFeatureListQuery,
  useToggleBetaStatusMutation,
  useUpdateBetaFeatureListMutation
} from '@acx-ui/user'

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
  const { data: betaFeaturesList } = useGetBetaFeatureListQuery({ params })
  const [updateBetaFeatures] = useUpdateBetaFeatureListMutation()

  const onSave = async () => {
    onClose()
    try {
      await toggleBetaStatus({
        params: {
          enable: true + ''
        }
      }).unwrap()
      // only send feature(ids) that is disabled
      const payloadList = featureList.filter((feature =>
        feature.enabled === false)).map((item) => item.id )
      const payload = { betaFeatureIds: payloadList }
      await updateBetaFeatures({ params, payload: payload }).unwrap()
      window.location.reload()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onClose = () => {
    setResetField(true)
    setVisible(false)
  }

  useEffect(() => {
    if (betaFeaturesList?.betaFeatures) {
      const features = betaFeaturesList.betaFeatures.map(f => {
        const found = BetaListDetails.filter(detail => detail.key === f.id)
        const desc = found.length > 0
          ? $t(BetaListDetails.filter(detail => detail.key === f.id)[0].description)
          : 'Sample: sample description'
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
      if (f.id === feature) {
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
    icon={<BetaIndicator size='md' />}
    visible={visible}
    onClose={onClose}
    width={'430px'}
    children={
      <UI.DrawerContentWrapper>
        {featureList.map(feature => {
          return <UI.DrawerContent key={feature.id}>
            <UI.FeatureTitleWrapper>
              <UI.FeatureTitle>{feature.name}</UI.FeatureTitle>
              <UI.EarlyAccessFeatureSwitch
                checkedChildren='ON'
                unCheckedChildren='OFF'
                defaultChecked={feature.enabled}
                checked={feature.enabled}
                onChange={(checked, e) => onFeatureToggle(checked, e, feature.id)} />
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
        <Button type='default' onClick={() => onClose()}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
        <Button
          type='primary'
          onClick={() => onSave()}>
          {editMode ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Enable Early Access' })}
        </Button>
      </UI.ButtonFooterWrapper>
    </UI.FooterWrapper>}
  />
}

export { R1FeatureListDrawer }

