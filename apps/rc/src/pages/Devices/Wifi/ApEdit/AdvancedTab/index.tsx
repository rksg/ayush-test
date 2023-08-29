import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { StepsFormLegacy }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { redirectPreviousPage }   from '@acx-ui/rc/utils'
import { useTenantLink }          from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext } from '..'

import { ApLed }       from './ApLed'
import { BssColoring } from './BssColoring'


export interface ApAdvancedContext {
  updateApLed?: (data?: unknown) => void | Promise<void>
  discardApLedChanges?: (data?: unknown) => void | Promise<void>

  updateBssColoring?: (data?: unknown) => void | Promise<void>
  discardBssColoringChanges?: (data?: unknown) => void | Promise<void>
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)

  const { apCapabilities } = useContext(ApDataContext)

  const supportLed = useIsSplitOn(Features.WIFI_FR_6029_FG3_2_TOGGLE)
  const supportBssColor = useIsSplitOn(Features.WIFI_AP_BSS_COLORING_TOGGLE)
    && apCapabilities?.support11AX


  const apLedTitle = $t({ defaultMessage: 'Access Point LEDs' })
  const bssColoringTitle = $t({ defaultMessage: 'BSS Coloring' })

  const anchorItems = [
    ...(supportLed? [{
      title: apLedTitle,
      key: 'apLed',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ap-led'>
            { apLedTitle }
          </StepsFormLegacy.SectionTitle>
          <ApLed />
        </>
      )
    }] : []),
    ...(supportBssColor? [{
      title: bssColoringTitle,
      key: 'bssColoring',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='bss-coloring'>
            { bssColoringTitle }
          </StepsFormLegacy.SectionTitle>
          <BssColoring />
        </>
      )

    }] : [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'advanced',
      isDirty: false
    })

    if (editAdvancedContextData) {
      const newData = { ...editAdvancedContextData }
      delete newData.updateApLed
      delete newData.discardApLedChanges
      delete newData.updateBssColoring
      delete newData.discardBssColoringChanges

      setEditAdvancedContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editAdvancedContextData.updateApLed?.()
      await editAdvancedContextData.updateBssColoring?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/wifi/${params.serialNumber}/details/overview`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editAdvancedContextData.discardApLedChanges?.()
      await editAdvancedContextData.discardBssColoringChanges?.()


      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
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
