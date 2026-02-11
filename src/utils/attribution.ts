import * as Linking from 'expo-linking';
import { tracker } from './tracker';

export const setupAttributionListeners = async () => {
    // 1. Initial URL
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
        handleUrl(initialUrl);
    }

    // 2. Listener
    Linking.addEventListener('url', (event) => {
        handleUrl(event.url);
    });
};

const handleUrl = (url: string) => {
    console.log('[Attribution] Received URL:', url);
    try {
        const { queryParams } = Linking.parse(url);

        if (queryParams?.click_id) {
            const clickId = String(queryParams.click_id);
            console.log('[Attribution] Found click_id:', clickId);
            tracker.setAttributionId(clickId);
        }
    } catch (e) {
        console.error('[Attribution] Parse error:', e);
    }
};
