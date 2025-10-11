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

    case 'customTable':
      return (
        <div className="section-break">
          <h2 className="section-title">Custom Table</h2>
          <table className="findings-table">
            <thead>
              <tr>
                {(data.headers || []).map((header: string, idx: number) => (
                  <th key={idx}>{header || `Column ${idx + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.cellData && data.cellData.length > 0) ? (
                data.cellData.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, colIndex: number) => (
                      <td key={colIndex}>
                        {cell || '-'}
                        {data.cellFileEnabled?.[rowIndex]?.[colIndex] && 
                         data.fileData?.[rowIndex]?.[colIndex] && 
                         data.fileData[rowIndex][colIndex].length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            {data.fileData[rowIndex][colIndex].map((file: UploadedFile, fileIdx: number) => (
                              isImageFile(file.name) ? (
                                <img 
                                  key={fileIdx}
                                  src={file.previewUrl} 
                                  alt={file.name}
                                  style={{ maxWidth: '200px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                />
                              ) : (
                                <div key={fileIdx} style={{ fontSize: '8pt', color: '#718096', marginTop: '4px' }}>
                                  📎 {file.name}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={data.headers?.length || 1}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      );

    case 'vulnerabilityTable':
      return (
        <div className="section-break">
          <h2 className="section-title">Vulnerabilities</h2>
          {(data.vulnerabilities && data.vulnerabilities.length > 0) ? (
            data.vulnerabilities.map((vuln: any, vulnIndex: number) => (
              <div key={vulnIndex} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                <h3 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
                  Vulnerability {vulnIndex + 1}: {vuln.header || 'Untitled'}
                </h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '10pt' }}>Description:</strong>
                  <p className="prose-text" style={{ marginTop: '4px' }}>{vuln.description || 'N/A'}</p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '10pt' }}>Impact:</strong>
                  <p className="prose-text" style={{ marginTop: '4px' }}>{vuln.impact || 'N/A'}</p>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '10pt' }}>Mitigation:</strong>
                  <p className="prose-text" style={{ marginTop: '4px' }}>{vuln.mitigation || 'N/A'}</p>
                </div>

                {vuln.stepsToReproduce && vuln.stepsToReproduce.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '10pt' }}>Steps to Reproduce:</strong>
                    <ol style={{ marginLeft: '1.5rem', marginTop: '8px' }}>
                      {vuln.stepsToReproduce.map((step: any, stepIndex: number) => (
                        <li key={stepIndex} style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                          <p style={{ fontSize: '10pt', margin: 0 }}>{step.text || 'N/A'}</p>
                          {step.screenshot && (
                            <div style={{ marginTop: '8px' }}>
                              <img 
                                src={step.screenshot.previewUrl} 
                                alt={step.label || 'Screenshot'}
                                style={{ maxWidth: '90%', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                              />
                              {step.label && (
                                <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#718096', marginTop: '4px' }}>
                                  {step.label}
                                </p>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
              </div>
            ))
          ) : (
            <p className="prose-text italic">No vulnerabilities documented.</p>
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