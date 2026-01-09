import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name, type }) {
  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{title} | SimpleApp Monitor</title>
      <meta name="description" content={description} />
      
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

SEO.defaultProps = {
  title: 'SimpleApp',
  description: 'Enterprise-grade uptime monitoring for everyone.',
  name: 'SimpleApp',
  type: 'website'
};
