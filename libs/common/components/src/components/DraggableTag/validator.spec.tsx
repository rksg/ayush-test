/* eslint-disable max-len */
import '@testing-library/jest-dom'

import {
  validateTagIsAlphanumeric,
  validateTagMaxLength,
  validateTagIsUnique
} from './validator'

describe('validator', () => {
  describe('validateTagIsAlphanumeric', () => {
    const addTag = { id: 'id', value: 'Test123', valid: true, isCustom: true }
    it('Should take care of tag value correctly', async () => {
      const result = validateTagIsAlphanumeric([addTag])
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if tag values incorrectly', async () => {
      const result = validateTagIsAlphanumeric([{ ...addTag, value: 'Test@123' }])
      await expect(result).rejects.toEqual('Only letters and numbers allowed (a–z, A–Z, 0–9).')
    })
  })

  describe('validateTagMaxLength', () => {
    const addTag = { id: 'id', value: 'Test123', valid: true, isCustom: true }
    it('Should take care of tag value correctly', async () => {
      const result = validateTagMaxLength([addTag], 10)
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display an error message when the length of a custom tag name exceeds the limit', async () => {
      const result = validateTagMaxLength([{ ...addTag, value: 'Test12345678901234567890' }], 10)
      await expect(result).rejects.toEqual('Up to 10 characters allowed per attribute.')
    })
  })

  describe('validateTagIsUnique', () => {
    const addTag = { id: 'id', value: 'Test123', valid: true, isCustom: true }
    const tagList = [
      { id: 'id-1', value: 'Option1', valid: true },
      { id: 'id-2', value: 'Custom1', valid: true, isCustom: true },
      { id: 'id-3', value: 'Custo2', valid: true, isCustom: true },
      { id: 'id-4', value: 'Test123', valid: true, isCustom: true }
    ]

    it('Should take care of tag value correctly', async () => {
      const result = validateTagIsUnique([], [addTag])
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display an error message when duplicate custom tag names exist', async () => {
      const result = validateTagIsUnique(tagList, [addTag])
      await expect(result).rejects.toEqual('Duplicate attributes.')
    })
    it('Should display an error message when a custom tag name matches a default option', async () => {
      const result = validateTagIsUnique(tagList, [{ ...addTag, value: 'Option1' }])
      await expect(result).rejects.toEqual('Duplicate attributes.')
    })
  })

})
