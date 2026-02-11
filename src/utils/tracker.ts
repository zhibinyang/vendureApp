import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { SGTM_ENDPOINT, MEASUREMENT_ID, SGTM_PREVIEW_ENABLED, SGTM_PREVIEW_HEADER } from '@env';

const STORAGE_KEYS = {
    CLIENT_ID: 'ga4_cid',
    SESSION_ID: 'ga4_sid',
    LAST_ACTIVE: 'ga4_last_active',
    FIRST_VISIT: 'ga4_first_visit',
    ATTRIBUTION_ID: 'attribution_id',
    USER_ID: 'ga4_uid',
};

// Types
type EventParams = Record<string, string | number | boolean | object>;

class Tracker {
    private cid: string | null = null;
    private sid: string | null = null;
    private userId: string | null = null;
    private isFirstVisit: boolean = false;
    private isSessionStart: boolean = false;
    private ready: boolean = false;

    /**
     * Initialize Tracker
     */
    async init() {
        try {
            await this.initClientId();
            await this.initUserId();
            await this.initSession();
            this.ready = true;
            console.log(`[Tracker] Initialized. CID: ${this.cid}, SID: ${this.sid}, UID: ${this.userId}`);
        } catch (e) {
            console.error('[Tracker] Init failed:', e);
        }
    }

    private async initClientId() {
        let cid = await AsyncStorage.getItem(STORAGE_KEYS.CLIENT_ID);
        if (!cid) {
            cid = uuidv4();
            await AsyncStorage.setItem(STORAGE_KEYS.CLIENT_ID, cid);
        }
        this.cid = cid;
    }

    private async initUserId() {
        this.userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    }

    private async initSession() {
        const now = Date.now();
        const lastActiveStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

        const hasVisited = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
        if (!hasVisited) {
            this.isFirstVisit = true;
            await AsyncStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
        }

        if (now - lastActive > 1800000 || !lastActive) {
            this.sid = this.generateSessionId();
            this.isSessionStart = true;
            await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sid);
        } else {
            this.sid = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
            if (!this.sid) {
                this.sid = this.generateSessionId();
                this.isSessionStart = true;
            }
        }
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, now.toString());
    }

    private generateSessionId(): string {
        return Math.floor(Date.now() / 1000).toString();
    }

    private async heartbeat() {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
    }

    async setUserId(userId: string | null) {
        this.userId = userId;
        if (userId) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
            console.log('[Tracker] User ID set:', userId);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
            console.log('[Tracker] User ID cleared');
        }
    }

    async trackEvent(eventName: string, params: EventParams = {}) {
        if (!this.ready) {
            console.warn('[Tracker] Not ready, waiting for init...');
            await this.init();
        }

        await this.heartbeat();

        const query = new URLSearchParams();
        query.append('v', '2');
        query.append('tid', MEASUREMENT_ID);
        query.append('cid', this.cid || 'unknown');
        if (this.userId) {
            query.append('uid', this.userId);
        }
        query.append('en', eventName);
        query.append('sid', this.sid || 'unknown');

        if (this.isSessionStart) {
            query.append('_ss', '1');
            this.isSessionStart = false;
        }
        if (this.isFirstVisit) {
            query.append('_fv', '1');
            this.isFirstVisit = false;
        }

        const deviceParams = {
            platform: 'mobile_app',
            os_name: Device.osName || Platform.OS,
            os_version: Device.osVersion || Platform.Version.toString(),
            device_model: Device.modelName || 'unknown',
        };

        const attributionId = await AsyncStorage.getItem(STORAGE_KEYS.ATTRIBUTION_ID);
        if (attributionId) {
            query.append('ep.click_id', attributionId);
        }

        const allParams = { ...deviceParams, ...params };

        Object.entries(allParams).forEach(([key, value]) => {
            const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            query.append(`ep.${key}`, strValue);
        });

        if (SGTM_PREVIEW_ENABLED === 'true') {
            query.append('_dbg', '1');
        }

        const url = `${SGTM_ENDPOINT}?${query.toString()}`;

        if (__DEV__) {
            console.log(`[Tracker] Sending: ${eventName}`, url);
        }

        try {
            const headers: Record<string, string> = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            };
            if (SGTM_PREVIEW_ENABLED === 'true' && SGTM_PREVIEW_HEADER) {
                headers['x-gtm-server-preview'] = SGTM_PREVIEW_HEADER;
            }

            await fetch(url, {
                method: 'POST',
                headers
            });
        } catch (e) {
            console.error('[Tracker] Send failed:', e);
        }
    }

    async setAttributionId(clickId: string) {
        if (!clickId) return;
        await AsyncStorage.setItem(STORAGE_KEYS.ATTRIBUTION_ID, clickId);
        console.log('[Tracker] Attribution ID saved:', clickId);
    }

    async clearAttributionId() {
        await AsyncStorage.removeItem(STORAGE_KEYS.ATTRIBUTION_ID);
        console.log('[Tracker] Attribution ID cleared');
    }
}

export const tracker = new Tracker();
