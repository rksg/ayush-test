import { useEffect, useState } from 'react'

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
  const [ currentData, setCurrentData ] = useState<MdnsProxyFormData>({} as MdnsProxyFormData)
  const { data: dataFromServer } = useGetMdnsProxyQuery({ params }, { skip: !editMode })
  const [ addMdnsProxy ] = useAddMdnsProxyMutation()

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
      <MdnsProxyFormContext.Provider value={{ editMode, currentData }}>
        <StepsForm<MdnsProxyFormData>
          editMode={editMode}
          onCancel={() => navigate(selectServicePath)}
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
