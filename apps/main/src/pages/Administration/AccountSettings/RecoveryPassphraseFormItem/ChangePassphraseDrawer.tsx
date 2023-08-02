import React, { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'
import styled         from 'styled-components/macro'


import { Drawer, Button }               from '@acx-ui/components'
import {
  useUpdateRecoveryPassphraseMutation
} from '@acx-ui/rc/services'
import { validateRecoveryPassphrasePart } from '@acx-ui/rc/utils'

import { MessageMapping } from '../MessageMapping'

import { MultiPartyPassword } from './MultiPartyPassword'
import * as UI                from './styledComponents'

interface ChangePassphraseDrawerProps {
  className?: string,
  data: string,
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const ChangePassphraseDrawer = styled((props: ChangePassphraseDrawerProps) => {
  const { $t } = useIntl()
  const { className, data, visible, setVisible } = props
  const { tenantId } = useParams()
  const [ isChanged, setIsChanged ] = useState(false)
  const [ isValid, setIsValid ] = useState(false)
  const [ passphrase, setPassphrase ] = useState<string[]>([])

  const [updateRecoveryPassphrase, { isLoading: isUpdatingRecoveryPassphrase }]
    = useUpdateRecoveryPassphraseMutation()

  const onClose = () => {
    setVisible(false)
  }

  const onSubmitChange = async () => {
    try {
      await updateRecoveryPassphrase({
        params: { tenantId },
        payload: { psk: passphrase.join('') }
      }).unwrap()

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleValidated = (isValid: boolean) => {
    if (isValid) {
      setIsValid(true)
      setIsChanged(true)
    } else {
      setIsValid(false)
    }
  }

  const handleChange = (idx: number, newData: string[]) => {
    setPassphrase(newData)
  }

  React.useEffect(() => {
    if (visible)
      setPassphrase(data.trim() === '' ? [] : data.split(' '))
  }, [data, visible])

  return (
    <Drawer
      className={className}
      title={$t({ defaultMessage: 'Change Recovery Network Passphrase' })}
      visible={visible}
      onClose={onClose}
      width='550px'
      destroyOnClose={true}
      footer={
        <div>
          <Button
            disabled={!isChanged || !isValid}
            loading={isUpdatingRecoveryPassphrase}
            onClick={onSubmitChange}
            type='primary'
          >
            {$t({ defaultMessage: 'Change' })}
          </Button>
          <Button onClick={onClose}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </div>
      }
    >
      <MultiPartyPassword
        data={passphrase}
        label={$t({ defaultMessage: 'Recovery Network Passphrase' })}
        tooltip={$t({ defaultMessage: 'Must be 16 digits long' })}
        rules={[
          {
            validator: (_, value) => validateRecoveryPassphrasePart(value)
          }
        ]}
        onValidated={handleValidated}
        onChange={handleChange}
      >
        <Typography.Paragraph className='greyText'>
          {$t(MessageMapping.change_recovery_passphrase_description)}
        </Typography.Paragraph>
      </MultiPartyPassword>
    </Drawer>
  )
})`${UI.drawerStyles}`
