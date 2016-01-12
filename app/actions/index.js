import * as corporaActions from './corpora'
import * as serversActions from './servers'
import * as tabsActions from './tabs'
import * as intlActions from './intl'

const allActions = {
  ...corporaActions,
  ...serversActions,
  ...tabsActions,
  ...intlActions
}

export default allActions
