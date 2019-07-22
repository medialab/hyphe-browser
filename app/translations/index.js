import en_json from './en.json'
import fr_json from './fr.json'
import intro_en from './intro_en.md'
import intro_fr from './intro_fr.md'
export const en = {
  ...en_json,
  'intro_md': intro_en
}
export const fr = {
  ...fr_json,
  'intro_md': intro_fr
}