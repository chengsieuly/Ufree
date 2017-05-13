import { createRouter } from '@expo/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RootNavigation from './RootNavigation';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import AuthScreen from '../screens/AuthScreen';

export default createRouter(() => ({
  auth: () => AuthScreen,
  home: () => HomeScreen,
  links: () => LinksScreen,
  settings: () => SettingsScreen,


  calendar: () => ComingSoonScreen,
  chat: () => ComingSoonScreen,

  
  rootNavigation: () => RootNavigation,
}));
