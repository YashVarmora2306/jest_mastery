"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import styles from './MarkdownRenderer.module.css';

// Disable Prism's auto-highlighting to prevent hydration mismatches
// This must be set before Prism tries to highlight automatically
if (typeof window !== 'undefined') {
  Prism.manual = true;
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        components={{
          pre: ({ node, ...props }) => <pre className={styles.pre} {...props} />,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : null;
            
            if (lang) {
              const codeContent = String(children).replace(/\n$/, '');
              let highlighted = codeContent;
              
              try {
                if (languages[lang]) {
                  highlighted = highlight(codeContent, languages[lang], lang);
                }
              } catch (e) {
                // fallback
              }

              return (
                <code 
                  className={`${className} ${styles.blockCode}`} 
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                  {...props} 
                />
              );
            }

            return (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
