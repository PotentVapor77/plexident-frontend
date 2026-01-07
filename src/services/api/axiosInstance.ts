import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

import { API_BASE_URL, ENDPOINTS, TIMEOUTS } from '../../config/api';
import { logger } from '../../utils/logger';
import { createApiError } from '../../types/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUTS.api,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    if (!error.response) return true;
    const status = error.response.status;

    if (status >= 500) return true;  
    if (status === 429) return false; 
    return false;                    
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`Reintentando petición (${retryCount}/3)`, {
      url: requestConfig.url,
      method: requestConfig.method,
      error: error.message,
    });
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.metadata = { startTime: Date.now() };
    logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    logger.error('Error en request interceptor', error);
    return Promise.reject(createApiError(error));
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : undefined;
    logger.api(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      duration
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isSilentEndpoint =
      originalRequest?.url?.includes('/auth/me') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (!isSilentEndpoint) {
      logger.api(
        originalRequest?.method?.toUpperCase() || 'GET',
        originalRequest?.url || '',
        undefined,
        error
      );
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        logger.debug('Token expirado, intentando refresh...');
        await api.post(ENDPOINTS.auth.refresh);
        logger.info('Token refrescado exitosamente');
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        if (!isSilentEndpoint) {
          logger.error('Refresh token expirado', refreshError);
        }
        processQueue(refreshError as AxiosError);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    if (!error.response) {
      const apiError = createApiError(error);
      logger.error('Error de red', apiError);
      return Promise.reject(apiError);
    }

    return Promise.reject(createApiError(error));
  }
);

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

export const apiWithExtendedTimeout = axios.create({
  ...api.defaults,
  timeout: TIMEOUTS.fileUpload,
  withCredentials: true,
});

apiWithExtendedTimeout.interceptors.request = api.interceptors.request;
apiWithExtendedTimeout.interceptors.response = api.interceptors.response;

export default api;
