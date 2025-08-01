import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadedFile, NodeData } from './nodes/types';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

export interface ReportComponent { type: 'sectionHeader' | 'textInput' | 'table' | 'codeSnippet' | 'linkedStories' | 'fileUpload' | 'steps' | string; data: NodeData; }
interface ReportPreviewProps { reportComponents: ReportComponent[] | null; }

const isImageFile = (filename: string): boolean => /\.(jpe?g|png|gif|webp|svg)$/i.test(filename);
const EmptyPlaceholder: React.FC<{ text?: string }> = ({ text = "[No content provided]" }) => <p className="text-muted-foreground italic my-2">{text}</p>;

const ComponentRenderer: React.FC<{ component: ReportComponent }> = ({ component }) => {
  const { type, data } = component;
  switch (type) {
    case 'sectionHeader': return <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">{data.title || <EmptyPlaceholder text="[Empty Header]" />}</h2>;
    case 'textInput':
      if (data.fieldType === 'projectName') return <h1 className="text-3xl font-bold text-primary mb-6">{data.value || <EmptyPlaceholder text="[No Project Name]" />}</h1>;
      const titles: { [key: string]: string } = { scope: "Scope of Work", baselines: "Baselines for Review" };
      return (
        <div>
          {titles[data.fieldType] && <h3 className="text-xl font-semibold mt-6 mb-3">{titles[data.fieldType]}</h3>}
          {data.value ? <p className="text-muted-foreground whitespace-pre-wrap">{data.value}</p> : <EmptyPlaceholder />}
          {data.fieldType === 'baselines' && data.url && (
            <Button asChild variant="link" className="p-0 h-auto mt-2">
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Baseline URL
              </a>
            </Button>
          )}
        </div>
      );
    case 'table':
      return (
        <div className="my-6"><h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">Test Cases</h2><div className="overflow-x-auto"><table className="min-w-full border-collapse border border-border mt-4">
          <thead><tr>{['ID', 'Test Case', 'Category', 'Exploited', 'URL', 'Evidence', 'Status', 'Tester'].map(h => <th key={h} className="border bg-muted px-4 py-2 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {(data.testCases && data.testCases.length > 0) ? (
              data.testCases.map((tc: any, index: number) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{tc.id}</td><td className="border px-4 py-2">{tc.testCase}</td><td className="border px-4 py-2">{tc.category}</td><td className="border px-4 py-2">{tc.exploited}</td><td className="border px-4 py-2">{tc.url}</td>
                  <td className="border px-4 py-2">{(tc.evidence || []).map((ev: UploadedFile, i: number) => <span key={i} className="block font-mono text-xs">{ev.path}</span>)}</td>
                  <td className="border px-4 py-2">{tc.status}</td><td className="border px-4 py-2">{tc.tester}</td>
                </tr>
              ))
            ) : ( <tr><td colSpan={8} className="text-center p-4 text-muted-foreground italic">No test cases added.</td></tr> )}
          </tbody>
        </table></div></div>
      );
    case 'codeSnippet': return <div className="my-6"><h3 className="text-xl font-semibold mt-6 mb-3">{data.title || "Code Snippet"}</h3>{data.content ? <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto"><code>{data.content}</code></pre> : <EmptyPlaceholder />}</div>;
    case 'linkedStories': return <div className="my-6"><h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">Change Description & Stories</h2>{data.changeDescription ? <p className="mb-4">{data.changeDescription}</p> : <EmptyPlaceholder text="[No change description provided]" />}{(data.linkedStories && data.linkedStories.length > 0) ? <ul className="list-disc list-inside space-y-2">{data.linkedStories.map((story: any, index: number) => <li key={index}><strong>{story.id}:</strong> {story.title}</li>)}</ul> : <EmptyPlaceholder text="[No linked stories]" />}</div>;
    case 'fileUpload':
      return (
        <div className="my-6"><h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">Attachments</h2>
          {(data.files && data.files.length > 0) ? (
            <div className="mt-2 space-y-2">{data.files.map((file: UploadedFile, index: number) => isImageFile(file.name) ? <img key={index} src={file.previewUrl} alt={file.name} className="max-w-[300px] border rounded" /> : <div key={index} className="font-mono text-xs">{file.path}</div>)}</div>
          ) : <EmptyPlaceholder text="[No files attached]" />}
        </div>
      );
    case 'steps':
        return (
            <div className="my-6">
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">Steps to Reproduce</h2>
                {(data.steps && data.steps.length > 0 && data.steps.some((s:any) => s.text)) ? (
                    <ol className="list-decimal list-inside space-y-4 mt-4">
                        {data.steps.map((step: any) => (
                            <li key={step.id}>
                                <p className="mb-2">{step.text || <EmptyPlaceholder />}</p>
                                {step.image && isImageFile(step.image.name) && ( <img src={step.image.previewUrl} alt={`Screenshot for step`} className="max-w-md border rounded-md ml-6 my-2" /> )}
                            </li>
                        ))}
                    </ol>
                ) : <EmptyPlaceholder text="[No steps provided]" />}
            </div>
        );
    default: return null;
  }
};
export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportComponents }) => {
  return (
    <div className="h-full bg-background"><ScrollArea className="h-full"><div className="max-w-4xl mx-auto p-8"><div className="bg-card rounded-lg border border-border p-8 shadow-lg min-h-[200px]"><div className="prose dark:prose-invert max-w-none">
      {!reportComponents || reportComponents.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><p className="text-lg font-medium mb-2">The preview is empty.</p><p className="text-sm">Add or fill out components in the builder and click "Show Preview".</p></div>
      ) : ( reportComponents.map((component, index) => <ComponentRenderer key={`${component.type}-${index}`} component={component} />) )}
    </div></div></div></ScrollArea></div>
  );
};