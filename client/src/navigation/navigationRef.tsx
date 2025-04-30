import * as React from 'react';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { StackParamList } from '../navigation/types';

export const navigationRef = React.createRef<NavigationContainerRef<StackParamList>>();

// More robust navigation method that works with nested navigators
export function navigate(screenName: string, params: any = undefined) {
  if (navigationRef.current) {
    // Use CommonActions.navigate for better handling of nested navigators
    navigationRef.current.dispatch(
      CommonActions.navigate({
        name: screenName,
        params,
      })
    );
  }
}
