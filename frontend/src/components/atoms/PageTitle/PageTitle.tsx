import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
}

const SITE_NAME = 'Denis Chamkaga';

/**
 * PageTitle — sets document.title and updates the meta description
 * for the current page. Must be rendered inside each page component.
 */
export const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  useEffect(() => {
    let pageTitle: string;
    
    // Ensure 'Denis Assistant' page displays exactly 'Denis Assistant' in browser tab
    if (title.toLowerCase().startsWith('denis assistant')) {
      pageTitle = 'Denis Assistant';
    } else if (title.includes(SITE_NAME)) {
      pageTitle = title;
    } else {
      pageTitle = `${title} | ${SITE_NAME}`;
    }

    document.title = pageTitle;

    // Dynamically update Open Graph & Twitter Social Metadata in <head>
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = pageTitle;

    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = pageTitle;

    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;

      const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = description;

      const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
      if (twDesc) twDesc.content = description;
    }

    return () => {
      document.title = `${SITE_NAME} | Web Software Developer`;
    };
  }, [title, description]);

  return null;
};

// TypeScript needs React imported for JSX even though we use null return
import React from 'react';
export default PageTitle;
