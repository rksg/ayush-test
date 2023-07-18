import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { redirectPreviousPage }          from '@acx-ui/rc/utils'
import { useTenantLink }                 from '@acx-ui/react-router-dom'

import { ApEditContext } from '..'

import { ApSnmp }    from './ApSnmp'
import { MdnsProxy } from './MdnsProxy/MdnsProxy'



export interface ApNetworkControlContext {
  updateMdnsProxy?: (data?: unknown) => void | Promise<void>
  discardMdnsProxyChanges?: (data?: unknown) => void | Promise<void>

  updateApSnmp?: (data?: unknown) => void | Promise<void>
  discardApSnmpChanges?: (data?: unknown) => void | Promise<void>
}

export function NetworkControlTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)

  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)


  const mPorxyTitle = $t({ defaultMessage: 'mDNS Proxy' })
  const apSnmpTitle = $t({ defaultMessage: 'AP SNMP' })


  const anchorItems = [
    ...(isServicesEnabled? [{
      title: mPorxyTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { mPorxyTitle }
          </StepsFormLegacy.SectionTitle>
          <MdnsProxy />
        </>
      )
    }] : []),
    ...(supportApSnmp? [{
      title: apSnmpTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { apSnmpTitle }
          </StepsFormLegacy.SectionTitle>
          <ApSnmp />
        </>
      )

    }] : [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      isDirty: false
    })

    if (editNetworkControlContextData) {
      const newData = { ...editNetworkControlContextData }
      delete newData.updateMdnsProxy
      delete newData.discardMdnsProxyChanges
      delete newData.updateApSnmp
      delete newData.discardApSnmpChanges

      setEditNetworkControlContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editNetworkControlContextData.updateMdnsProxy?.()
      await editNetworkControlContextData.updateApSnmp?.()

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
      await editNetworkControlContextData.discardMdnsProxyChanges?.()
      await editNetworkControlContextData.discardApSnmpChanges?.()

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
        <AnchorLayout items={anchorItems} offsetTop={275} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )

}
