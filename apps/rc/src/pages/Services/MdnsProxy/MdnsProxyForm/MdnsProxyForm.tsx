import { useEffect, useState } from 'react'

import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, StepsForm }  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useAddMdnsProxyMutation,
  useGetMdnsProxyQuery,
  useUpdateMdnsProxyMutation
} from '@acx-ui/rc/services'
import {
  MdnsProxyFormData,
  getServiceRoutePath,
  ServiceType,
  ServiceOperation,
  getServiceListRoutePath
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
  const tablePath = getServiceRoutePath({
    type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST
  })
  const serviceTablePath = useTenantLink(tablePath)
  const [ currentData, setCurrentData ] = useState<MdnsProxyFormData>({} as MdnsProxyFormData)
  const { data: dataFromServer } = useGetMdnsProxyQuery({ params }, { skip: !editMode })
  const [ addMdnsProxy ] = useAddMdnsProxyMutation()
  const [ updateMdnsProxy ] = useUpdateMdnsProxyMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'mDNS Proxy' }),
            link: tablePath
          }
        ] : [
          {
            text: $t({ defaultMessage: 'Services' }),
            link: tablePath
          }
        ]}
      />
      <MdnsProxyFormContext.Provider value={{ editMode, currentData }}>
        <StepsForm<MdnsProxyFormData>
          editMode={editMode}
          onCancel={() => navigate(serviceTablePath)}
          onFinish={(data) => saveData(editMode, data)}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            onFinish={updateCurrentData}
          >
            <MdnsProxySettingsForm />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={updateCurrentData}
          >
            <MdnsProxyScope />
          </StepsForm.StepForm>
          {!editMode &&
            <StepsForm.StepForm
              name='summary'
              title={$t({ defaultMessage: 'Summary' })}
              onFinish={async () => {
                return true
              }}
            >
              <MdnsProxySummary />
            </StepsForm.StepForm>
          }

        </StepsForm>
      </MdnsProxyFormContext.Provider>
    </>
  )
}
