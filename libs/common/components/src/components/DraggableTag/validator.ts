/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { DraggableTag } from './DraggableTagSelector'

const DraggableTagMessageMapping = {
  InvalidCharacters: defineMessage({
    defaultMessage: 'Only letters and numbers allowed (a–z, A–Z, 0–9).'
  }),
  DuplicateCustomTagAttribute: defineMessage({
    defaultMessage: 'Duplicate attributes.'
  }),
  ExceedTagAttributeLengthLimit: defineMessage({
    defaultMessage: 'Up to {maxNumber} characters allowed per attribute.'
  })
}

export const validateTagIsAlphanumeric = (val: DraggableTag[]) => {
  const { $t } = getIntl()
  const value = val?.[0]?.value
  const re = new RegExp(/^[a-zA-Z0-9]+$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(DraggableTagMessageMapping.InvalidCharacters))
  }
  return Promise.resolve()
}

export const validateTagMaxLength = (val: DraggableTag[], maxNumber: number) => {
  const { $t } = getIntl()
  const value = val?.[0]?.value
  if (value.length > maxNumber) {
    return Promise.reject($t(DraggableTagMessageMapping.ExceedTagAttributeLengthLimit, { maxNumber }))
  }
  return Promise.resolve()
}

export const validateTagIsUnique = (allTags: DraggableTag[], val: DraggableTag[]) => {
  const { $t } = getIntl()
  const current = val?.[0]
  const isDuplicate = allTags
    ?.filter((t: DraggableTag) => t.id !== current?.id)
    .some((t: DraggableTag) => t.value === current?.value)

  return isDuplicate
    ? Promise.reject($t(DraggableTagMessageMapping.DuplicateCustomTagAttribute))
    : Promise.resolve()
}
