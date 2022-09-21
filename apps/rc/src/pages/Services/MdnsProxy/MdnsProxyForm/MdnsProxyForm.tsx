import { useEffect, useRef, useState } from 'react'

import _                                from 'lodash'
import { useIntl }                      from 'react-intl'
import { Path, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, showToast, StepsForm }              from '@acx-ui/components'
import { useAddMdnsProxyMutation, useGetMdnsProxyQuery } from '@acx-ui/rc/services'
import { MdnsProxyFormData }                             from '@acx-ui/rc/utils'
import { useTenantLink }                                 from '@acx-ui/react-router-dom'

import { MdnsProxyScope }   from '../MdnsProxyScope/MdnsProxyScope'
import { MdnsProxySummary } from '../MdnsProxySummary/MdnsProxySummary'

import MdnsProxyFormContext      from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'



export interface MdnsProxyFormProps {
  editMode?: boolean;
}

export function MdnsProxyForm ({ editMode = false }: MdnsProxyFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const servicesTablePath: Path = useTenantLink('/services')
  const selectServicePath: Path = useTenantLink('/services/select')
  const [ defaultData, setDefaultData ] = useState<MdnsProxyFormData>()
  const [ currentData, setCurrentData ] = useState<MdnsProxyFormData>({} as MdnsProxyFormData)
  const { data } = useGetMdnsProxyQuery({ params }, { skip: !editMode })
  const [ addMdnsProxy ] = useAddMdnsProxyMutation()
  const defaultDataLoaded = useRef<boolean>(false)

  useEffect(() => {
    if (!defaultDataLoaded.current && data && editMode) {
      setDefaultData(data)
      setCurrentData(data)
      defaultDataLoaded.current = true
    }
  }, [data, editMode])

  const updateCurrentData = (data: Partial<MdnsProxyFormData>) => {
    setCurrentData({
      ...currentData,
      ...data
    })
  }

  const saveData = async (editMode: boolean, data: MdnsProxyFormData) => {
    try {
      const payload = editMode ? data : _.omit(data, 'id')
      await addMdnsProxy({ params, payload }).unwrap()
      navigate(servicesTablePath, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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
          { text: $t({ defaultMessage: 'Add Service' }), link: '/services/select' }
        ]}
      />
      <MdnsProxyFormContext.Provider value={{ editMode, defaultData, currentData }}>
        <StepsForm<MdnsProxyFormData>
          editMode={editMode}
          onCancel={() => navigate(selectServicePath)}
          onFinish={(data) => saveData(editMode, data)}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            onFinish={async (data) => {
              updateCurrentData(data)
              return true
            }}
          >
            <MdnsProxySettingsForm />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={async (data) => {
              updateCurrentData(data)
              return true
            }}
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
