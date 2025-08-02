import { ReportBuilderContainer } from '@/components/ReportBuilder';

const Index = () => {
  // We now render the ReportBuilderContainer, which includes the necessary
  // ReactFlowProvider for all child components (like the AI node) to work correctly.
  return <ReportBuilderContainer />;
};

export default Index;