
/**
 * Global style imports
 */
import './global.styl'

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
 * Field notes
 */
import FieldNotesMock from './FieldNotesMock'
storiesOf('Field notes', module)
  .add('Sketch', () => <FieldNotesMock />)

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
import EntityExistsModalMock from './EntityExistsModalMock'
storiesOf('New entity modal', module)
  .add('Mockup', () => <EntityModalMock />)
  .add('Existing prefix', () => <EntityModalMock withPreviousTags withExistingPrefix />)
  .add('Creating an entity with previous tags', () => <EntityModalMock withPreviousTags />)
  .add('Attempting to create an entity that create a duplicate with an existing one', () => <EntityExistsModalMock />)



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

/**
 * Splash screen / loading
 */
import SplashScreen from './SplashScreen'
storiesOf('Splash screen & loading', module)
  .add('Mockup', () => <SplashScreen />)

/**
 * Server choice
 */
import ServerChoice from './ServerChoice'
storiesOf('Server choice', module)
  .add('No server chosen', () => <ServerChoice noServer />)
  .add('Server choice (loading)', () => <ServerChoice loading />)
  .add('Server choice', () => <ServerChoice />)
  .add('Add a new server', () => <ServerChoice newServer />)
  .add('Add a new corpus', () => <ServerChoice newCorpus />)

/**
 * Redirection modal
 */
import RedirectionModalMock from './RedirectionModalMock'
storiesOf('Redirection modal', module)
  .add('Mockup', () => <RedirectionModalMock />)
  .add('Denied redirection', () => <BrowserLayoutProposal status={ 'prospection' } hasDeniedRedirection/>)
