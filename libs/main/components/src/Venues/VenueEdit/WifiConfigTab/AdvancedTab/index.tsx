import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { StepsFormLegacy }              from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import { redirectPreviousPage }         from '@acx-ui/rc/utils'
import { useNavigate }                  from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../index'

import { AccessPointLED }   from './AccessPointLED'
import { ApManagementVlan } from './ApManagementVlan'
import { BssColoring }      from './BssColoring'


export interface ModelOption {
  label: string
  value: string
}

export interface AdvanceSettingContext {
  updateAccessPointLED?: (() => void),
  updateBssColoring?: (() => void),
  updateApManagementVlan?: (() => void)
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData,
    previousPath } = useContext(VenueEditContext)


  const supportBssColoring = useIsSplitOn(Features.WIFI_FR_6029_FG1_TOGGLE)
  const supportApMgmgtVlan = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)


  const anchorItems = [{
    title: $t({ defaultMessage: 'Access Point LEDs' }),
    key: 'apLed',
    content: <>
      <StepsFormLegacy.SectionTitle id='access-point-led'>
        { $t({ defaultMessage: 'Access Point LEDs' }) }
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
  ),
  ...(supportApMgmgtVlan? [{
    title: $t({ defaultMessage: 'Access Point Management VLAN' }),
    key: 'apMgmtVlan',
    content: <>
      <StepsFormLegacy.SectionTitle id='ap-mgmt-vlan'>
        { $t({ defaultMessage: 'Access Point Management VLAN' })}
      </StepsFormLegacy.SectionTitle>
      <ApManagementVlan />
    </>
  }] : [])
  ]



  const handleUpdateAllSettings = async () => {
    try {
      await editAdvancedContextData?.updateAccessPointLED?.()
      await editAdvancedContextData?.updateBssColoring?.()
      await editAdvancedContextData?.updateApManagementVlan?.()

      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        isDirty: false
      })

      if (editAdvancedContextData) {
        const newData = { ...editAdvancedContextData }
        delete newData.updateAccessPointLED
        delete newData.updateBssColoring
        delete newData.updateApManagementVlan
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
        <AnchorLayout items={anchorItems} offsetTop={60} />
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
