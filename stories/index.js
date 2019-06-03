
/**
 * Global style imports
 */
import '../app/css/style.styl'
import '../app/css/themify-icons.css'
import '../app/css/hint.base.css'
import './helpers.styl'

/**
 * Components specific style imports
 */
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
  .add('With existing categories', () => 
    (
      <TagsMock 
        startingCategories={ [{ category: 'language', value: 'fr' }, { category: 'type', value: 'media' }] }
      />
    )
  )

/**
 * Cited webentities cartel
 */import KnownPagesMock from './KnownPagesMock'
storiesOf('Known pages', module)
  .add('Example', () => <KnownPagesMock />)

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
const complexWEParts = [
  { name: 'https', editable: false }, 
  { name: '.org', editable: false }, 
  { name: 'wikipedia', editable: true }, 
  { name: 'fr.', editable: true }, 
  { name: '/wiki', editable: true }, 
  { name: '/La_Maison_des_feuilles', editable: true }, 
]
import PrefixSetter from './PrefixSetter'
storiesOf('Prefix setter', module)
  .add('Simple', () => <PrefixSetter parts={ simpleWEParts } />)
  .add('With sub-url', () => <PrefixSetter parts ={ complexWEParts } />)


/**
 * Browser toolbar
 */
import BrowserBarMock from './BrowserBarMock'
storiesOf('Browser bar', module)
  .add('For a prospection entity', () => <BrowserBarMock displayAddButton={ false } />)
  .add('For an IN entity', () => <BrowserBarMock displayAddButton />)
  .add('For a homepage', () => <BrowserBarMock displayAddButton isHomePage />)

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
 * New tab content
 */
import NewTabContent from './NewTabContent'
storiesOf('New tab content', module)
  .add('Mockup', () => 
    (<div style={ { width: '100%' } }>
      <NewTabContent />
    </div>)
  )

/**
 * Layout proposal
 */
import BrowserLayoutProposal from './BrowserLayout'
storiesOf('Global layout proposal', module)
  .add('Reviewing a PROSPECTION', () => <BrowserLayoutProposal status={ 'prospection' } />)
  .add('Reviewing an IN', () => <BrowserLayoutProposal status={ 'in' } />)
  .add('Reviewing an OUT', () => <BrowserLayoutProposal status={ 'out' } />)
  .add('Reviewing an UNDECIDED', () => <BrowserLayoutProposal status={ 'undecided' } />)
  .add('Landing in existing corpus', () => <BrowserLayoutProposal status={ 'prospection' } isLanding />)
  .add('Landing in new corpus', () => <BrowserLayoutProposal status={ 'prospection' } isEmpty isLanding />)