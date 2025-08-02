import React from 'react';
import { ReportComponent } from './ReportPreview';
import { UploadedFile } from './nodes/types';

interface PdfTemplateProps {
  reportComponents: ReportComponent[];
}

const isImageFile = (filename: string): boolean => /\.(jpe?g|png|gif|webp|svg)$/i.test(filename);

const PdfComponentRenderer: React.FC<{ component: ReportComponent }> = ({ component }) => {
  const { type, data } = component;

  switch (type) {
    case 'sectionHeader':
      return <div className="section-break"><h2 className="section-title">{data.title || 'Untitled Section'}</h2></div>;

    case 'textInput':
      if (data.fieldType === 'projectName') {
        // Project name is handled in the main header, so we can skip rendering it here.
        return null; 
      }
      const titles: { [key: string]: string } = { scope: "Scope of Work", baselines: "Baselines for Review" };
      return (
        <div className="content-block">
          {titles[data.fieldType] && <h3 className="content-title">{titles[data.fieldType]}</h3>}
          <p className="prose-text">{data.value || 'N/A'}</p>
          {data.fieldType === 'baselines' && data.url && (
            <div className="link-box">Reference URL: <a href={data.url}>{data.url}</a></div>
          )}
        </div>
      );
    
    case 'table':
      return (
        <div className="section-break">
          <h2 className="section-title">Test Cases & Findings</h2>
          <table className="findings-table">
            <thead><tr>{['ID', 'Test Case', 'Category', 'Status', 'Tester'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {(data.testCases && data.testCases.length > 0) ? (
                data.testCases.map((tc: any, index: number) => (
                  <tr key={index}>
                    <td>{tc.id}</td><td>{tc.testCase}</td><td>{tc.category}</td><td>{tc.status}</td><td>{tc.tester}</td>
                  </tr>
                ))
              ) : ( <tr><td colSpan={5}>No test cases added.</td></tr> )}
            </tbody>
          </table>
        </div>
      );

    case 'codeSnippet':
      return (
        <div className="content-block">
            <h3 className="content-title">{data.title || 'Code Snippet'}</h3>
            <pre className="code-block"><code>{data.content || ''}</code></pre>
        </div>
      );
      
    case 'steps':
        return (
            <div className="section-break">
                <h2 className="section-title">Steps to Reproduce</h2>
                {(data.steps && data.steps.length > 0 && data.steps.some((s:any) => s.text)) ? (
                    <ol className="steps-list">
                        {data.steps.map((step: any, index: number) => (
                            <li key={step.id}>
                                <p><strong>Step {index + 1}:</strong> {step.text}</p>
                                {step.image && isImageFile(step.image.name) && (
                                    <img src={step.image.previewUrl} alt="Step evidence" className="step-image" />
                                )}
                            </li>
                        ))}
                    </ol>
                ) : <p className="prose-text italic">No steps provided.</p>}
            </div>
        );

    case 'fileUpload':
        return (
            <div className="section-break">
                <h2 className="section-title">Attachments</h2>
                {(data.files && data.files.length > 0) ? (
                    <div className="attachment-grid">
                      {data.files.map((file: UploadedFile) => 
                        isImageFile(file.name) ?
                        <div key={file.path} className="attachment-image-container">
                            <img src={file.previewUrl} alt={file.name} />
                            <p>{file.path}</p>
                        </div> :
                        <div key={file.path} className="attachment-file">{file.path}</div>
                      )}
                    </div>
                ) : <p className="prose-text italic">No files attached.</p>}
            </div>
        );
        
    case 'linkedStories':
        return (
            <div className="content-block">
                <h3 className="content-title">Change Description & Linked Stories</h3>
                <p className="prose-text"><strong>Description:</strong> {data.changeDescription || 'N/A'}</p>
                {data.linkedStories && data.linkedStories.length > 0 && (
                    <ul className="link-list">
                        {data.linkedStories.map((story: any, index: number) => (
                            <li key={index}>
                                <a href={story.url || '#'}>{story.id}: {story.title}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    
    default: return null;
  }
};

export const PdfTemplate: React.FC<PdfTemplateProps> = ({ reportComponents }) => {
  const projectNameComponent = reportComponents?.find(c => c.type === 'textInput' && c.data.fieldType === 'projectName');
  const projectName = projectNameComponent ? projectNameComponent.data.value : 'Security Report';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div id="pdf-content-wrapper" className="pdf-container">
      <div className="header">
        <h1>Confidential Security Assessment</h1>
        <h2>{projectName}</h2>
        <p className="date">{today}</p>
      </div>
      
      <main className="content">
        {reportComponents?.map((component, index) => (
          <PdfComponentRenderer key={`${component.type}-${index}`} component={component} />
        ))}
      </main>
    </div>
  );
};