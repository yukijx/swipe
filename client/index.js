import { registerRootComponent } from 'expo';
import App from '../client/src/App.tsx';
// import 'react-native-polyfill-globals/auto';

// needed to export the app since expo needs a .js file as the 'index'
registerRootComponent(App);