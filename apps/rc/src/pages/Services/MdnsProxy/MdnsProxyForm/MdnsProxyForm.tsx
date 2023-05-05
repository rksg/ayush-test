import { useEffect, useState } from 'react'

import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsFormLegacy } from '@acx-ui/components'
import {
  useAddMdnsProxyMutation,
  useGetMdnsProxyQuery,
  useUpdateMdnsProxyMutation
} from '@acx-ui/rc/services'
import {
  MdnsProxyFormData,
  getServiceRoutePath,
  ServiceType,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate } from '@acx-ui/react-router-dom'

import { MdnsProxyScope }   from '../MdnsProxyScope/MdnsProxyScope'
import { MdnsProxySummary } from '../MdnsProxySummary/MdnsProxySummary'

import MdnsProxyFormContext      from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'


export interface MdnsProxyFormProps {
  editMode?: boolean;
}

export default function MdnsProxyForm ({ editMode = false }: MdnsProxyFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const serviceTablePath = useTenantLink(getServiceRoutePath({
    type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST
  }))
  const [ currentData, setCurrentData ] = useState<MdnsProxyFormData>({} as MdnsProxyFormData)
  const { data: dataFromServer } = useGetMdnsProxyQuery({ params }, { skip: !editMode })
  const [ addMdnsProxy ] = useAddMdnsProxyMutation()
  const [ updateMdnsProxy ] = useUpdateMdnsProxyMutation()

  useEffect(() => {
    if (dataFromServer && editMode) {
      setCurrentData(dataFromServer)
    }
  }, [dataFromServer, editMode])

  const updateCurrentData = async (data: Partial<MdnsProxyFormData>) => {
    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

  const saveData = async (editMode: boolean, data: MdnsProxyFormData) => {
    try {
      if (editMode) {
        await updateMdnsProxy({ params, payload: _.omit(data, 'id') }).unwrap()
      } else {
        await addMdnsProxy({ params, payload: data }).unwrap()
      }

      navigate(serviceTablePath, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure mDNS Proxy Service' })
          : $t({ defaultMessage: 'Add mDNS Proxy Service' })
        }
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Services' }),
            link: getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })
          }
        ]}
      />
      <MdnsProxyFormContext.Provider value={{ editMode, currentData }}>
        <StepsFormLegacy<MdnsProxyFormData>
          editMode={editMode}
          onCancel={() => navigate(serviceTablePath)}
          onFinish={(data) => saveData(editMode, data)}
        >
          <StepsFormLegacy.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            onFinish={updateCurrentData}
          >
            <MdnsProxySettingsForm />
          </StepsFormLegacy.StepForm>
          <StepsFormLegacy.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={updateCurrentData}
          >
            <MdnsProxyScope />
          </StepsFormLegacy.StepForm>
          {!editMode &&
            <StepsFormLegacy.StepForm
              name='summary'
              title={$t({ defaultMessage: 'Summary' })}
              onFinish={async () => {
                return true
              }}
            >
              <MdnsProxySummary />
            </StepsFormLegacy.StepForm>
          }

        </StepsFormLegacy>
      </MdnsProxyFormContext.Provider>
    </>
  )
}
