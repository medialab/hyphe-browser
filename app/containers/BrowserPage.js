import { connect } from 'react-redux';
import Browser from '../components/Browser';
import { toggleSidebar, openTab, closeTab, selectTab, setTabUrl, setTabTitle, setTabIcon, setTabStatus } from '../actions/browser';

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
  setTabUrl,
  setTabIcon,
  setTabTitle,
  setTabStatus,
};

export default connect(mapStateToProps, actions)(Browser);
