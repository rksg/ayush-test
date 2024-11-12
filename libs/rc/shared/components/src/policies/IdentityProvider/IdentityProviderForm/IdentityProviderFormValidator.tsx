import { getIntl } from '@acx-ui/utils'


export const validatePlmnMcc = (value: string) => {
  const { $t } = getIntl()

  const re = new RegExp(/^\d{3}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t({
      defaultMessage: 'This field must be exactly 3 digits long'
    }))
  }

  return Promise.resolve()
}

export const validatePlmnMnc = (value: string) => {
  const { $t } = getIntl()

  const re = new RegExp(/^\d{2,3}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t({
      defaultMessage: 'This field must be 2 or 3 digits long'
    }))
  }

  return Promise.resolve()

}