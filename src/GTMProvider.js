import React, { useRef, useEffect } from 'react';
import { useDeepCompareEffect, usePrevious } from 'react-use';
import { Helmet } from 'react-helmet';
import { GTMContext } from './contexts';

const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [
    {
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    },
  ];
  return window.dataLayer;
};

const GTMProvider = ({
  data,
  children,
  location,
  gtmTags = [],
  initialDataLayer = {},
  isInitialDataLayerReady = true,
  hasDebugEnabled = false,
}) => {
  const pageRef = useRef();
  const dataLayer = useRef(initializeDataLayer());
  const previousIsDataLayerReady = usePrevious(isInitialDataLayerReady);

  useEffect(() => {
    if (hasDebugEnabled) {
      console.log(
        '%cReact GTM',
        'background-color: #ff6a13;font-size:14px;',
        'activated tags',
        gtmTags,
      );
    }
  }, [gtmTags]);

  const getCurrentDataLayer = () => ({
    ...initialDataLayer,
    ...(pageRef.current && pageRef.current.buildDataLayer
      ? pageRef.current.buildDataLayer(data)
      : {}),
  });

  const handlePush = data => {
    if (hasDebugEnabled) {
      console.log(
        '%cReact GTM',
        'background-color: #ff6a13;font-size:14px;',
        'pushed to dataLayer: ',
        data,
      );
    }
    dataLayer.current.push(data);
  };

  useDeepCompareEffect(() => {
    if (!isInitialDataLayerReady) {
      return;
    }

    handlePush({
      event: 'virtual-pageview',
      ...getCurrentDataLayer(),
    });
  }, [location]);

  useEffect(() => {
    if (!isInitialDataLayerReady || previousIsDataLayerReady) {
      return;
    }

    handlePush({
      event: 'virtual-pageview',
      ...getCurrentDataLayer(),
    });
  }, [isInitialDataLayerReady]);

  useDeepCompareEffect(() => {
    handlePush(getCurrentDataLayer());
  }, [initialDataLayer]);

  return (
    <>
      <Helmet>
        {gtmTags.map(gtmId => (
          <script src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} />
        ))}
      </Helmet>
      <GTMContext.Provider value={{ pushDataLayer: handlePush, pageRef }}>
        {children}
      </GTMContext.Provider>
    </>
  );
};

export default GTMProvider;
