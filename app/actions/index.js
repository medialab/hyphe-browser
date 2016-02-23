import * as corporaActions from './corpora'
import * as serversActions from './servers'
import * as stackActions from './stacks'
import * as tabsActions from './tabs'
import * as intlActions from './intl'

const allActions = {
  ...corporaActions,
  ...serversActions,
  ...stackActions,
  ...tabsActions,
  ...intlActions
}

export default allActions
