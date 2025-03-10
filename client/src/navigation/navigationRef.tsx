import * as React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StackParamList } from '../navigation/types';

export const navigationRef = React.createRef<NavigationContainerRef<StackParamList>>();

export function navigate<T extends keyof StackParamList>(screen: T, params: StackParamList[T]): void;
export function navigate<T extends keyof StackParamList>(screen: T): void;
export function navigate<T extends keyof StackParamList>(screen: T, params?: StackParamList[T]) {
  // Cast params to 'any' to simplify the union type complexity
  navigationRef.current?.navigate(screen, params as any);
}
