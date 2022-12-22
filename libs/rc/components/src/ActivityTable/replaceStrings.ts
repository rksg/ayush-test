import _ from 'lodash'

/**
 * Replaces "@@template" or "%%template" of given template
 */
export function replaceStrings <Data> (
  template: string | undefined,
  data: Data
) {
  if (template === undefined) return ''

  const matches = template.match(new RegExp(/(@@|%%)\w+/, 'g')) || []
  for (const match of matches) {
    const value = String(_.get(data, match.slice(2), ''))
    template = template.replace(match, value)
  }

  return template
}
