import _ from 'lodash'

/**
 * Flattens a nested object, using dot notation for keys.
 * @param {Object} obj - The object to flatten.
 * @param {string} parentKey - The base key for recursion.
 * @param {Object} res - The result object.
 * @returns {Object} - The flattened object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenObject (obj: Record<string, any>, parentKey = '', res = {}) {
  return _.transform(obj, (result, value, key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key
    if (_.isObject(value) && !_.isArray(value)) {
      flattenObject(value, newKey, result)
    } else {
      result[newKey] = value
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, res as Record<string, any>)
}