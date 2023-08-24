import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { StepsFormLegacy }            from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { redirectPreviousPage }       from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../index'

import { AccessPointLED } from './AccessPointLED'
import { BssColoring }    from './BssColoring'


export interface ModelOption {
  label: string
  value: string
}

export interface AdvanceSettingContext {
  updateAccessPointLED?: (() => void),
  updateBssColoring?: (() => void)
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData,
    previousPath } = useContext(VenueEditContext)


  const supportBssColoring = useIsSplitOn(Features.WIFI_FR_6029_FG1_TOGGLE)


  const anchorItems = [{
    title: $t({ defaultMessage: 'Access Point LED' }),
    key: 'apLed',
    content: <>
      <StepsFormLegacy.SectionTitle id='access-point-led'>
        { $t({ defaultMessage: 'Access Point LED' }) }
      </StepsFormLegacy.SectionTitle>
      <div style={{ maxWidth: '465px' }}>
        <AccessPointLED />
      </div>
    </>
  },
  ...(supportBssColoring? [{
    title: $t({ defaultMessage: 'BSS Coloring' }),
    key: 'bssColoring',
    content: <>
      <StepsFormLegacy.SectionTitle id='bss-coloring'>
        { $t({ defaultMessage: 'BSS Coloring' }) }
      </StepsFormLegacy.SectionTitle>
      <BssColoring />
    </>
  }] : []
  )]



  const handleUpdateAllSettings = async () => {
    try {
      await editAdvancedContextData?.updateAccessPointLED?.()
      await editAdvancedContextData?.updateBssColoring?.()

      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        isDirty: false
      })

      if (editAdvancedContextData) {
        const newData = { ...editAdvancedContextData }
        delete newData.updateAccessPointLED
        delete newData.updateBssColoring
        setEditAdvancedContextData(newData)
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
        {/*
        <AnchorLayout items={anchorItems} />
        */}
        {
          anchorItems.map(item => (
            <div key={item.key} style={{ paddingBottom: '50px' }}>
              {item.content}
            </div>))
        }
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
