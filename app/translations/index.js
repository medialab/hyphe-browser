import en_json from './en.json'
import fr_json from './fr.json'
import intro_en from './intro_en.md'
import intro_fr from './intro_fr.md'

/**
 * Preparing HTML contents for the intro by
 * adding definitions to key terms
 */
const [intro_en_processed, intro_fr_processed] = [
  [en_json, intro_en],
  [fr_json, intro_fr]
].map(([dict, md]) => {
  const definitions = Object.keys(dict)
    .filter(key => key.indexOf('definition.') === 0)
    .map((key) => ({ key: [key.split('definition.').pop()], value: dict[key]}));

  const processed = definitions.reduce((str, definition) => {
    const regexp = new RegExp('<a href="#' + definition.key + '">([^<]*)<\/a>', 'gi')
    let match;
    while ((match = regexp.exec(str)) !== null) {
      const content = match[1];
      const newContent = `<span class="definition hint--top" aria-label="${definition.value}">${content}</span>`;
      str = `${str.slice(0, match.index)}${newContent}${str.slice(match.index + match[0].length)}`
    }
    return str;
  }, md)
  return processed;
})

export const en = {
  ...en_json,
  'intro_md': intro_en_processed
}
export const fr = {
  ...fr_json,
  'intro_md': intro_fr_processed
}