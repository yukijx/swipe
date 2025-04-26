import * as React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StackParamList } from '../navigation/types';

export const navigationRef = React.createRef<NavigationContainerRef<StackParamList>>();

// Use a simpler implementation to avoid TypeScript errors with complex navigate signatures
export function navigate(screenName: string, params: any = undefined) {
  if (navigationRef.current) {
    // Using any to bypass typechecking issues
    (navigationRef.current as any).navigate(screenName, params);
  }
}
