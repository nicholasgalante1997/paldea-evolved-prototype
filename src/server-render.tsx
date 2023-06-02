/**
 * @abstract
 * HTML Templating Engine
 * This function accepts two arguments: A React Component that you wish to dehydrate into
 * 'static' markup, and an options object that assists in driving the Component configuration.
 * The function loads a public template html file - html.production.template, and then
 * embeds the result of dehydrating the component into a mounting element within the
 */

// https://github.com/facebook/react/issues/24125#issuecomment-1073314294
// we'll need to switch to renderToPipeableStream in server-render.tsx
// can pipe(res) directly

import React from 'react';
import { renderToString } from 'react-dom/server';
import { Hydrate, type QueryClient, QueryClientProvider } from 'react-query';
import { type ApolloClient, ApolloProvider } from '@apollo/client';
import { renderToStringWithData } from '@apollo/client/react/ssr';
import path from 'path';
import fs from 'fs';

const HEAD_TAG_MOUNT = '<!-- __head_mount__ -->' as const;
const STYLESHEET_TAG_MOUNT = '<!-- __style_sheet_mount__ -->' as const;
const REACT_QUERY_TAG_MOUNT = '<!-- __react_query_script_mount__ -->' as const;
const APOLLO_CLIENT_TAG_MOUNT = '<!-- __apollo_client_script_mount__ -->' as const;
const PROP_DRIVER_TAG_MOUNT = '<!-- __data_state_mount__ -->' as const;
const CLIENT_JS_BUNDLE_TAG_MOUNT = '<!-- __client_js_mount__ -->' as const;

export interface HeadTagConfig {
  content: string;
  name: string;
}

export interface EmbedOptions {
  bundleName: string;
  headTags?: HeadTagConfig[];
  stylesheet?: string;
  queryConfig?: {
    queryClient: QueryClient;
    dehydratedState: any;
  };
  apolloConfig?: {
    apolloClient: ApolloClient<any>;
  };
  props?: Record<string, any>;
}

function withQueryClient(
  config: {
    queryClient: QueryClient;
    dehydratedState: any;
  },
  tree: JSX.Element
): JSX.Element {
  return (
    <QueryClientProvider client={config?.queryClient}>
      <Hydrate state={config.dehydratedState}>{tree}</Hydrate>
    </QueryClientProvider>
  );
}

function withApolloClientProvider(config: { apolloClient: ApolloClient<any> }, tree: JSX.Element): JSX.Element {
  return <ApolloProvider client={config.apolloClient}>{tree}</ApolloProvider>;
}

export async function embed(Component: React.ComponentType<any>, options: EmbedOptions) {
  let html: string;
  let pageString: string;
  let error: Error | undefined;

  try {
    console.log('retrieving html template...');
    html = fs.readFileSync(path.resolve(process.cwd(), 'html', 'prod.template.html'), { encoding: 'utf-8' });

    console.log('Setting up reactNode for dehydration...');
    let reactNode: JSX.Element = <Component {...(options.props != null ? options.props : {})} />;

    if (options.queryConfig != null) {
      reactNode = withQueryClient({ ...options.queryConfig }, reactNode);
    }

    if (options.apolloConfig != null) {
      reactNode = withApolloClientProvider({ ...options.apolloConfig }, reactNode);
      const graphQLHydratedPageString = await renderToStringWithData(reactNode);
      reactNode = <div id="apollo-hydration-container" dangerouslySetInnerHTML={{ __html: graphQLHydratedPageString }}></div>;
    }

    console.log('Dehydrating styled-components on server...');
    pageString = renderToString(reactNode);
  } catch (e: any) {
    console.error(e);
    error = e as Error;
    throw e;
  } finally {
    console.log(`operation ended: status "${error != null ? 'failed' : 'successful'}"`, error != null ? 'error' : 'info');
  }

  if (options.headTags != null && options.headTags?.length > 0) {
    let metaTagString = '';
    for (const metaTag of options.headTags) {
      metaTagString += `<meta name="${metaTag.name}" content="${metaTag.content}">`;
    }
    html = html.replace(HEAD_TAG_MOUNT, metaTagString);
  } else {
    html = html.replace(HEAD_TAG_MOUNT, '');
  }

  if (options.props != null && Object.keys(options.props).length > 0) {
    const componentStateElement = `<div id="component-state-mount">${JSON.stringify({ props: options.props }).replace(
      /</g,
      '\\u003c'
    )}</div>`;
    html = html.replace(PROP_DRIVER_TAG_MOUNT, componentStateElement);
  } else {
    html = html.replace(PROP_DRIVER_TAG_MOUNT, '');
  }

  if (options.queryConfig != null && options.queryConfig.dehydratedState) {
    const reactQueryScriptTag = `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(options.queryConfig.dehydratedState).replace(
      /</g,
      '\\u003c'
    )};</script>`;
    html = html.replace(REACT_QUERY_TAG_MOUNT, reactQueryScriptTag);
  } else {
    html = html.replace(REACT_QUERY_TAG_MOUNT, '');
  }

  if (options.apolloConfig != null) {
    const apolloClientCache = options.apolloConfig.apolloClient.extract();
    const apolloClientScriptTag = `<script>window.__APOLLO_STATE__=${JSON.stringify(apolloClientCache).replace(/</g, '\\u003c')};</script>`;
    html = html.replace(APOLLO_CLIENT_TAG_MOUNT, apolloClientScriptTag);
  } else {
    html = html.replace(APOLLO_CLIENT_TAG_MOUNT, '');
  }

  if (options.stylesheet) {
    const stylesheet = `<link rel="stylesheet" type="text/css" href="/pages/${options.stylesheet}.css">\n`;
    html = html.replace(STYLESHEET_TAG_MOUNT, stylesheet);
  } else {
    html = html.replace(STYLESHEET_TAG_MOUNT, '');
  }

  const scriptTag = `<script src="/${options.bundleName}.bundle.js" defer></script>`;
  html = html.replace(CLIENT_JS_BUNDLE_TAG_MOUNT, scriptTag);

  return html.replace('<div id="production-root"></div>', `<div id="production-root">${pageString}</div>`);
}
