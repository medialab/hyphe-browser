import * as corporaActions from './corpora'
import * as serversActions from './servers'
import * as tabsActions from './tabs'

const allActions = {
  ...corporaActions,
  ...serversActions,
  ...tabsActions
}

export default allActions
