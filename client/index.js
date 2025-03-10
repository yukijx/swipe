import { registerRootComponent } from 'expo';
import App from '../client/src/navigation/App';
// import 'react-native-polyfill-globals/auto';

// needed to export the app since expo needs a .js file as the 'index'
registerRootComponent(App);