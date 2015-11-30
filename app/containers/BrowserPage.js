import { connect } from 'react-redux';
import Browser from '../components/Browser';
import { toggleSidebar, openTab, closeTab, selectTab } from '../actions/browser';

function mapStateToProps({ browser: { sidebarVisible, tabs, activeTab } }) {
  return {
    sidebarVisible,
    tabs,
    activeTab,
  };
}

const actions = {
  toggleSidebar,
  openTab,
  closeTab,
  selectTab,
};

export default connect(mapStateToProps, actions)(Browser);
