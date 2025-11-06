'use client';
import React, { PropsWithChildren } from "react";
import { SWRConfig, SWRConfiguration } from "swr";

import { AdapterFactory } from "@/adapters/Factory";
import { createFetcher } from '@/helpers/createSWRFetcher';

type SWRProviderProps = Partial<SWRConfiguration>;

const RequestProvider: React.FC<PropsWithChildren<SWRProviderProps>> = ({ children, ...swrConfig }) => {
  const exchange = AdapterFactory.createAdapter('okx');
  const fetcher = exchange ?  createFetcher(exchange) : undefined;

  const defaultSWRConfig: Partial<SWRConfiguration> = {
    fetcher: fetcher,
    // dedupingInterval 仅用于去重同键在一定时间内的重复请求，不是轮询
    dedupingInterval: 2000,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    // 出错不重试，避免隐式的再次请求
    shouldRetryOnError: false,
    errorRetryCount: 0,
    ...swrConfig,
  };

  return (
    <SWRConfig value={defaultSWRConfig}>
      {children}
    </SWRConfig>
  );
};

export default RequestProvider;