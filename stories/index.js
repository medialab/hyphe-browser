
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
storiesOf('Known pages', module)
  .add('Example', () => <CitedPagesMock />)

/**
 * Linked webentities cartel
 */
import LinkedEntitiesMock from './LinkedEntitiesMock'
storiesOf('Linked webentities', module)
  .add('Example', () => <LinkedEntitiesMock />)

/**
   * Prefix setter component
   */
const simpleWEParts = [
  { name: 'https', editable: false }, 
  { name: '.com', editable: false }, 
  { name: 'github', editable: true }, 
  { name: '/denoland', editable: true }, 
  { name: '/deno', editable: true },
]
import PrefixSetter from './PrefixSetter'
storiesOf('Prefix setter', module)
  .add('Simple', () => <PrefixSetter parts={ simpleWEParts } />)


/**
 * Browser toolbar
 */
import BrowserBarMock from './BrowserBarMock'
storiesOf('Browser bar', module)
  .add('Mockup', () => <BrowserBarMock />)

/**
 * New entity modal
 */
import EntityModalMock from './EntityModalMock'
storiesOf('New entity modal', module)
  .add('Mockup', () => <EntityModalMock />)

/**
 * Entity card
 */
import EntityCard from './EntityCard'
storiesOf('Entity card', module)
  .add('Mockup', () => 
    (<div style={ { width: '500px' } }>
      <EntityCard name="Facebook" url="https://facebook.com" numberOfCitations={ 12 } />
    </div>)
  )

/**
 * Layout proposal
 */
import BrowserLayoutProposal from './BrowserLayout'
storiesOf('Global layout proposal', module)
  .add('Main', () => <BrowserLayoutProposal />)

/**
 * Existing layout
 */
import ExistingLayoutMock from './ExistingLayoutMock'
storiesOf('Existing layout', module)
  .add('Existing layout', () => <ExistingLayoutMock />)