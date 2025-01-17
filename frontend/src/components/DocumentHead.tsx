import React from "react";
import { Helmet } from "react-helmet-async";

interface DocumentHeadProps {
  title: string;
  description?: string;
  keywords?: string;
}

const DocumentHead: React.FC<DocumentHeadProps> = ({
  title,
  description,
  keywords,
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
    </Helmet>
  );
};

export default DocumentHead;
