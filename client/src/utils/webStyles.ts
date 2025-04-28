import { Platform } from 'react-native';

export const webStyles = {
    container: {
        maxWidth: Platform.OS === 'web' ? '1200px' : '100%',
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        width: '100%',
    },
    card: {
        boxShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.1)' : undefined,
        transition: Platform.OS === 'web' ? 'all 0.2s ease' : undefined,
        cursor: Platform.OS === 'web' ? 'pointer' : undefined,
    },
    input: {
        outlineWidth: Platform.OS === 'web' ? '1px' : undefined,
        outlineStyle: Platform.OS === 'web' ? 'solid' : undefined,
        outlineColor: Platform.OS === 'web' ? '#893030' : undefined,
        width: Platform.OS === 'web' ? '400px' : '100%',
    },
    button: {
        transition: Platform.OS === 'web' ? 'all 0.2s ease' : undefined,
        cursor: Platform.OS === 'web' ? 'pointer' : undefined,
        ':hover': Platform.OS === 'web' ? {
            opacity: 0.9,
            transform: 'translateY(-1px)',
        } : undefined,
    }
}; 