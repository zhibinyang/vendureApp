import * as React from 'react';
import { StatusBar } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

import { Provider } from './src/context/context';
import { client } from './src/api/client';
import MainStackNavigator from './src/components/MyStack';
import { tracker } from './src/utils/tracker';
import { setupAttributionListeners } from './src/utils/attribution';

export default function App() {
    useEffect(() => {
        // Init Tracker
        tracker.init();
        // Setup Attribution
        setupAttributionListeners();
    }, []);

    return (
        <ApolloProvider client={client}>
            <Provider>
                <NavigationContainer
                    linking={{
                        prefixes: [Linking.createURL('/'), 'vendureapp://'],
                        config: {
                            screens: {
                                // Add screens here as needed for deep linking
                            },
                        },
                    }}
                    onReady={() => {
                        console.log('[App] Navigation Ready');
                        // Track initial screen
                        tracker.logPageView('Home'); // Default to Home if we can't get current route easily, or logic below
                    }}
                    onStateChange={(state) => {
                        const currentRoute = state?.routes[state.index];
                        if (currentRoute) {
                            const screenName = currentRoute.name;
                            console.log('[App] Screen Change:', screenName);
                            tracker.logPageView(screenName);
                        }
                    }}
                >
                    <StatusBar barStyle="dark-content" />
                    <MainStackNavigator />
                </NavigationContainer>
            </Provider>
        </ApolloProvider>
    );
}