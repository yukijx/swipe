// import '@react-navigation/native';
// import '@react-navigation/stack';
import '@react-navigation/core'


// declare module '@react-navigation/native' {
//   interface Navigator {
//     id?: string | undefined;
//   }
// }
// declare module '@react-navigation/stack' {
//   interface Navigator {
//     id?: string | undefined;
//   }
// }
declare module '@react-navigation/core' {
  interface Navigator {
    id?: string | undefined;
  }
}