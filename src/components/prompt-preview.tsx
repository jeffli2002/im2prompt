'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PromptPreviewProps {
  prompt: string;
  negativePrompt?: string;
  modelStyle: string;
}

interface ParsedSection {
  title: string;
  content: string;
  tags?: string[];
}

export function PromptPreview({ prompt, negativePrompt, modelStyle }: PromptPreviewProps) {
  const [viewMode, setViewMode] = useState<'text' | 'preview'>('preview');

  const extractRealContent = (rawPrompt: string): string => {
    try {
      const parsed = JSON.parse(rawPrompt);
      if (parsed.output) {
        return parsed.output.replace(/\\n/g, '\n');
      }
    } catch (e) {
      // Not JSON, return as is but still process \n
      return rawPrompt.replace(/\\n/g, '\n');
    }
    return rawPrompt;
  };

  const parsePromptSections = (text: string): ParsedSection[] => {
    const realText = extractRealContent(text);
    const sections: ParsedSection[] = [];
    
    const sectionRegex = /\*\*([^:*]+?):\*\*\s*\n([\s\S]*?)(?=\n\n\*\*|$)/g;
    let match;
    
    while ((match = sectionRegex.exec(realText)) !== null) {
      const title = match[1]?.trim();
      const rawContent = match[2]?.trim();
      
      const bracketMatch = rawContent.match(/^\[(.*?)\]$/s);
      
      if (bracketMatch) {
        const tags = bracketMatch[1]
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        sections.push({
          title,
          content: '',
          tags
        });
      } else {
        sections.push({
          title,
          content: rawContent
        });
      }
    }
    
    if (sections.length === 0) {
      sections.push({
        title: 'Prompt',
        content: realText
      });
    }
    
    return sections;
  };

  const getPlainTextOutput = () => {
    const sections = parsePromptSections(prompt);
    let output = '';
    
    sections.forEach(section => {
      output += `**${section.title}:**\n`;
      if (section.tags && section.tags.length > 0) {
        section.tags.forEach(tag => {
          output += `• ${tag}\n`;
        });
      } else {
        output += `${section.content}\n`;
      }
      output += '\n';
    });
    
    return output.trim();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Prompt copied to clipboard",
    });
  };

  const sections = parsePromptSections(prompt);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('text')}
            className="h-8 text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            Text
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className="h-8 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(viewMode === 'text' ? getPlainTextOutput() : extractRealContent(prompt))}
          className="h-8 px-2 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Copy All
        </Button>
      </div>

      {viewMode === 'text' ? (
        <div className="relative">
          <div className="w-full min-h-[300px] p-4 text-sm border rounded-lg bg-muted/30 overflow-auto whitespace-pre-wrap font-sans">
            {sections.map((section, index) => (
              <div key={index} className="mb-4">
                <div className="font-semibold text-primary mb-1">
                  {section.title}:
                </div>
                <div className="pl-4">
                  {section.tags && section.tags.length > 0 ? (
                    <ul className="space-y-1">
                      {section.tags.map((tag, i) => (
                        <li key={i} className="text-foreground/80">• {tag}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-foreground/80 leading-relaxed">
                      {section.content.split('\n').map((line, i) => (
                        <div key={i}>{line || '\u00A0'}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
          <div className="p-6 space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between group">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {section.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const copyText = section.tags 
                        ? section.tags.join(', ')
                        : section.content;
                      copyToClipboard(copyText);
                    }}
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="pl-4 border-l-2 border-primary/20">
                  {section.tags && section.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {section.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {negativePrompt && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-start justify-between group">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    Negative Prompt
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(negativePrompt)}
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="pl-4 border-l-2 border-destructive/20">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {negativePrompt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
