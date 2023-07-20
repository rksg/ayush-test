import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { StepsFormLegacy, AnchorLayout } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { redirectPreviousPage }          from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../index'

import { AccessPointLED } from './AccessPointLED'
import { RadiusOptions }  from './RadiusOptions'

export interface ModelOption {
  label: string
  value: string
}

export interface AdvanceSettingContext {
  updateAccessPointLED?: (() => void),
  updateRadiusOptions?: (() => void)
}

export function AdvancedSettingForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')

  const {
    editContextData,
    setEditContextData,
    editAdvanceSettingContext,
    setEditAdvanceSettingContext,
    previousPath } = useContext(VenueEditContext)
  const supportRadiusOptions = useIsSplitOn(Features.RADIUS_OPTIONS)


  const items = [{
    title: $t({ defaultMessage: 'Access Point LED' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='access-point-led'>
        { $t({ defaultMessage: 'Access Point LED' }) }
      </StepsFormLegacy.SectionTitle>
      <AccessPointLED />
    </>
  }]

  if (supportRadiusOptions) {
    items.push({
      title: $t({ defaultMessage: 'RADIUS Options' }),
      content: <>
        <StepsFormLegacy.SectionTitle id='radius-options'>
          { $t({ defaultMessage: 'RADIUS Options' }) }
        </StepsFormLegacy.SectionTitle>
        <RadiusOptions />
      </> })
  }

  const handleUpdateAllSettings = async () => {
    try {
      await editAdvanceSettingContext?.updateAccessPointLED?.()
      await editAdvanceSettingContext?.updateRadiusOptions?.()

      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        isDirty: false
      })

      if(editAdvanceSettingContext) {
        const newData = { ...editAdvanceSettingContext }
        delete editAdvanceSettingContext.updateAccessPointLED
        delete editAdvanceSettingContext.updateRadiusOptions
        setEditAdvanceSettingContext(newData)
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateAllSettings()}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
