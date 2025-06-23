import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { redirectPreviousPage }          from '@acx-ui/rc/utils'
import { useNavigate, useParams }        from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../../configTemplates'
import { ApGroupEditContext }           from '../context'


import { RadiusOptions } from './RadiusOptions'


export function ApGroupNetworkTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApGroupEditContext)


  const basePath = usePathBasedOnConfigTemplate('/devices/')

  const radiusOptionsSettingLink = $t({ defaultMessage: 'RADIUS Options' })
  const radiusOptionsSettingTitle = $t({ defaultMessage: 'RADIUS Options' })

  const anchorItems = [{
    title: radiusOptionsSettingLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='radio-settings'>
          { radiusOptionsSettingTitle }
        </StepsFormLegacy.SectionTitle>
        <RadiusOptions />
      </>
    )
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      await editNetworkingContextData.updateRadiusOptions?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/devices/apgroups/${params.apGroupId}/details/members`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editNetworkingContextData.discardRadiusOptionsChanges?.()

      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      isDirty: false
    })

    if (editNetworkingContextData) {
      const newData = { ...editNetworkingContextData }
      delete newData.updateRadiusOptions
      delete newData.discardRadiusOptionsChanges

      setEditNetworkingContextData(newData)
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
