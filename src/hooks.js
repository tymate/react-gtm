import { useContext, useImperativeHandle } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { GTMContext } from './contexts';

export const useGTM = () => {
  const { pushDataLayer = () => {} } = useContext(GTMContext) || {};
  return { pushDataLayer };
};

export const useDataLayer = data => {
  const { pushDataLayer = () => {} } = useContext(GTMContext) || {};

  useDeepCompareEffect(() => {
    pushDataLayer(data);
  }, [data]);
};

export const useDataLayerBuilder = builder => {
  const { pageRef } = useContext(GTMContext) || {};
  useImperativeHandle(pageRef, () => ({
    buildDataLayer: builder,
  }));
};
