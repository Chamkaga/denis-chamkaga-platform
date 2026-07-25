import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * InnovationPage — redirects legacy /innovation route to nested CreatorPage section.
 * This preserves bookmarks and prevents 404 search indexing regressions.
 */
export const InnovationPage: React.FC = () => {
  return <Navigate to="/creator#innovation-lab" replace />;
};

export default InnovationPage;
