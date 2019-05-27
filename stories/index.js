
/**
 * Global style imports
 */
import '../app/css/style.styl'
import '../app/css/themify-icons.css'
import '../app/css/hint.base.css'

/**
 * Components specific style imports
 */
import '../app/containers/SideBar/side-bar-tags.styl'
import '../app/containers/SideBar/side-bar.styl'
import 'react-select/dist/react-select.css'


/**
 * Storybook specific style imports
 */
import './stories.styl'
/**
 * JS libs import
 */
import React from 'react'

import { storiesOf } from '@storybook/react'

/**
 *  Components import
 */
// import Button from '../app/components/Button'

/**
 * ================================================
 * ----------------- STORIES ----------------------
 * ================================================
 */

/**
 * Help pin
 */
import PinExample from './PinExample'
storiesOf('Help pin (embedded documentation)', module)
  .add('example', () => <PinExample />)

/**
 * Research notes
 */
import ResearchNotesMock from './ResearchNotesMock'
storiesOf('Research notes', module)
  .add('Sketch', () => <ResearchNotesMock />)

/**
 * Tags cartel
 */
import TagsMock from './TagsMock'
storiesOf('Tags cartel', module)
  .add('Empty', () => <TagsMock />)
  .add('With existing categories', () => <TagsMock startingCategories={ [{ category: 'language', value: 'fr' }, { category: 'type', value: 'media' }] } />)

/**
 * Cited webentities cartel
 */import CitedPagesMock from './CitedPagesMock'
storiesOf('Cited pages', module)
  .add('Example', () => <CitedPagesMock />)

/**
 * Linked webentities cartel
 */
import LinkedEntitiesMock from './LinkedEntitiesMock'
storiesOf('Linked webentities', module)
  .add('Example', () => <LinkedEntitiesMock />)


/**
   * Existing layout
   */
import ExistingLayoutMock from './ExistingLayoutMock'
storiesOf('Existing layout', module)
  .add('Existing layout', () => <ExistingLayoutMock />)