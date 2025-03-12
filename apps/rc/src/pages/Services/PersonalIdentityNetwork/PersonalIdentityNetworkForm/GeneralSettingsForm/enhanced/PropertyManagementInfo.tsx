import { useContext, useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Loader, StepsForm }                    from '@acx-ui/components'
import { DpskSaveData, PersonaGroup, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                         from '@acx-ui/user'
import { getOpsApi }                                    from '@acx-ui/utils'

import { PersonalIdentityNetworkFormContext } from '../../PersonalIdentityNetworkFormContext'
import * as UI                                from '../../styledComponents'

import { PropertyManagementDrawer } from './PropertyManagementDrawer'

interface PropertyManagementInfoProps {
  venueId: string
  editMode?: boolean
}

export const PropertyManagementInfo = (props: PropertyManagementInfoProps) => {
  const { $t } = useIntl()
  const { venueId, editMode } = props
  const form = Form.useFormInstance()
  const {
    personaGroupId,
    isGetPropertyConfigError,
    isPropertyConfigLoading,
    isPersonaGroupLoading,
    isDpskLoading,
    personaGroupData,
    dpskData
  } = useContext(PersonalIdentityNetworkFormContext)
  const [propertyManagementDrawerVisible, setPropertyManagementDrawerVisible] = useState(false)

  useEffect(() => {
    if(!editMode && personaGroupId) {
      form.setFieldValue('personaGroupId', isGetPropertyConfigError ? undefined : personaGroupId)
    }
  }, [personaGroupId, isGetPropertyConfigError])

  const hasPropertyConfig = personaGroupId && !isGetPropertyConfigError

  const openPropertyManagementDrawer = () => {
    setPropertyManagementDrawerVisible(true)
  }

  const hasActivatePropertyPermission
    = hasAllowedOperations([getOpsApi(PropertyUrlsInfo.updatePropertyConfigs)])

  return <>
    <Loader states={[{
      isLoading: false,
      isFetching: isPropertyConfigLoading || isPersonaGroupLoading || isDpskLoading
    }]}>
      <StepsForm.FieldLabel width='140px'>
        {$t({ defaultMessage: 'Property management:' })}
        <Form.Item
          children={
            <UI.FieldTitle>
              {
                hasPropertyConfig ?
                  $t({ defaultMessage: 'On' }) :
                  $t({ defaultMessage: 'Off' })
              }
            </UI.FieldTitle>
          }
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>

      {hasPropertyConfig
        ? <PersonaInfo
          personaGroupData={personaGroupData}
          dpskData={dpskData} />
        : hasActivatePropertyPermission
        && <Button type='link' onClick={openPropertyManagementDrawer}>
          {$t({ defaultMessage: 'Activate Property Management' })}
        </Button>}

      <PropertyManagementDrawer
        visible={propertyManagementDrawerVisible}
        setVisible={setPropertyManagementDrawerVisible}
        venueId={venueId}
      />
    </Loader>

    <Form.Item
      name='personaGroupId'
      rules={[{ required: true }]}
      children={<Input hidden />}
      noStyle
    />
  </>
}

const PersonaInfo = ({ personaGroupData, dpskData }: {
  personaGroupData?: PersonaGroup,
  dpskData?: DpskSaveData
}) => {
  const { $t } = useIntl()

  return (
    <>
      <StepsForm.FieldLabel width='140px'>
        {$t({ defaultMessage: 'Identity Group:' })}
        <Form.Item
          children={<UI.FieldTitle>{personaGroupData?.name}</UI.FieldTitle>}
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>

      <StepsForm.FieldLabel width='140px'>
        {$t({ defaultMessage: 'DPSK Service:' })}
        <Form.Item
          children={<UI.FieldTitle>{dpskData?.name}</UI.FieldTitle>}
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>
    </>
  )
}
