const logout = async () => {
    try {
        await AsyncStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    } catch (error) {
        console.error('Error in logout:', error);
    }
}; 